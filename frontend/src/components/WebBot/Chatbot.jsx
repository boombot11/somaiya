import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLog } from '../contexts/LogContext';
import { FaRobot } from 'react-icons/fa';
import ChatHeader from './ChatHeader';
import ActivityLog from './ActivityLog';
import MessageList from './MessageList';
import FilePreview from './FilePreview';
import ChatInput from './ChatInput';
import { generatePrompt, parseStructuredResponse } from '../utils/promptEngine';
import Message from './Message';
import SnippetTool from './SnippetTool';
import { useUrl } from '../contexts/urlContext';
import useTripleClick from './useTripleClick';
import { enableDebugMode, fetchGraphData } from './domUtils';

const WebBot = () => {
  const { logs, addLog, chatHistory, addChatMessage } = useLog();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSnippetOpen, setIsSnippetOpen] = useState(false);
  const [snippetImage, setSnippetImage] = useState(null);
  const { imageUrl, setImageUrl, setImageData, imageData } = useUrl();
  const [files, setFiles] = useState([]);
  const [debug, setDebug] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chat, setChat] = useState(true);

  const [position, setPosition] = useState({ 
    x: window.innerWidth - 100, 
    y: Math.min(window.innerHeight - 100, 100) 
  });

  const dragStartPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const lastPos = useRef(position);
  const dragStartTimeout = useRef(null);
  const isClick = useRef(true);

  // Triple click handler
// In your Chatbot component
useTripleClick(({ content, structure, element, graphType }) => {
  if (!isOpen) setIsOpen(true);
  
  const elementType = element.tagName.toLowerCase();
  const elementClass = element.className ? ` with class "${element.className}"` : '';
  
  let prompt = `### Full Context Analysis\n\n` +
               `**Content:**\n${content}\n\n` +
               `Assume I am a lay man and i do not understand the content. Perform the role of a chatbot assistant and give me just the response from the context above which would accurately explain what the selected content is about to explain to the lay man. DO NOT GIVE ME ANY OTHER TEXT INFORMATION THAT SHOULD NOT BE DISPLAYED TO THE USER. JUST ACT AS A CHATBOT ASSISTANT`;
              // + `**Clicked Element:** ${elementType}${elementClass}`;
  
let displayMessage= `**Content:**\n${content}\n\n` ;

  // Add graph data if detected
  if (graphType) {
    prompt += `\n\n### Graph Data Detected\n` +
              `This appears to be a ${graphType} visualization. ` +
              `I can fetch and analyze the underlying data if needed.`;
    
    // You can add the actual data fetching here when backend is ready
    // const graphData = await fetchGraphData(graphType);
    // prompt += `\n\n**Data:**\n${JSON.stringify(graphData, null, 2)}`;
  }
  
  if(!debug)
  sendMessage(displayMessage);
}, {  
  clickWindow: 500, // Adjust this value (in ms) as needed
  highlightDuration: 3000
 });

useEffect(() => {
  // Enable debug mode if URL has debug flag
  if (window.location.search.includes('debug=tripleclick')) {
    enableDebugMode();
  }
}, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleShortcut = (e) => {
      if (e.ctrlKey && e.code === 'Space') {
        setIsOpen(true);
        setChat(false);
        setIsSnippetOpen(true);
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setChat(true);
        setIsSnippetOpen(false);
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  // Drag handlers
  const smoothDrag = useCallback((e) => {
    if (!isDragging) return;
    
    cancelAnimationFrame(animationRef.current);
    
    animationRef.current = requestAnimationFrame(() => {
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;
      
      const boundedX = Math.max(0, Math.min(newX, window.innerWidth - (isOpen ? 350 : 60)));
      const boundedY = Math.max(0, Math.min(newY, window.innerHeight - (isOpen ? 500 : 60)));
      
      setPosition({
        x: boundedX,
        y: boundedY
      });
      
      lastPos.current = { x: boundedX, y: boundedY };
    });
  }, [isDragging, isOpen]);

  const handleDragStart = (e) => {
    if (e.target.closest('.no-drag')) return;
    
    isClick.current = true;
    dragStartTimeout.current = setTimeout(() => {
      isClick.current = false;
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
      addLog(`Started dragging ${isOpen ? 'chat window' : 'chat icon'}`);
      document.body.style.userSelect = 'none';
    }, 200);
  };

  const handleDragEnd = useCallback(() => {
    if (dragStartTimeout.current) {
      clearTimeout(dragStartTimeout.current);
    }
    
    if (isDragging) {
      setIsDragging(false);
      cancelAnimationFrame(animationRef.current);
      document.body.style.userSelect = '';
      addLog(`Stopped dragging ${isOpen ? 'chat window' : 'chat icon'}`);
    }
  }, [isDragging, isOpen, addLog]);

  const toggleChat = (e) => {
    if (!isClick.current || isDragging) return;
    if (isOpen && !e.target.closest('.close-button')) return;
    
    const action = isOpen ? 'Closed chat window' : 'Opened chat window';
    addLog(action);
    setIsOpen(!isOpen);
    
    if (!isOpen) {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 350),
        y: Math.min(prev.y, window.innerHeight - 500)
      }));
    }
  };

  // Message handling
  const sendMessage = async (msg = message) => {
    const userMsg = typeof msg === 'string' ? msg : String(msg?.content || msg || '');
  
    if (userMsg.trim().length === 0 && files.length === 0) return;
    console.log(msg+":::"+message)
    // Create user message object
    const userMessage = {
      role: 'user',
      content: {
        title: 'You',
        content: userMsg,
        actions: [],
        links: []
      },
      ...(imageUrl && { imageUrl }),
      ...(files.length > 0 && { files: files.map(f => f.name) }) // Track file names
    };
  
    // Add user message to chat history immediately
    addChatMessage(userMessage);
    if (msg === message) setMessage('');
    setIsProcessing(true);
  
    try {
      // Generate system prompt with full context
      const { system, user } = generatePrompt(userMsg, logs, chatHistory, files);
  
      // Prepare conversation history for the API
      const conversationHistory = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content.content }]
      }));
  
      // Process all files (images and documents)
      const fileParts = await Promise.all(files.map(async (file) => {
        try {
          if (file.type.startsWith('image/')) {
            return {
              inlineData: {
                mimeType: file.type,
                data: await blobToBase64(file)
              }
            };
          } else if (file.type === 'application/pdf' ||
                    file.type === 'text/plain' ||
                    file.type.includes('document')) {
            const textContent = await extractTextFromFile(file);
            return {
              text: `FILE_CONTENT: ${file.name}\n${textContent.slice(0, 10000)}`
            };
          } else {
            return {
              text: `FILE_METADATA: ${file.name} (${file.type}, ${formatFileSize(file.size)})`
            };
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return {
            text: `FILE_ERROR: Failed to process ${file.name}`
          };
        }
      }));
  
      // Extract necessary data from imageData to avoid circular references
      let imagePart = [];
      if (imageData) {
        const base64Image = await blobToBase64(imageData);
        imagePart = [{
          inlineData: {
            mimeType: imageData.type || 'image/png',
            data: base64Image
          }
        }];
      }
  
      // Construct the API request with all content
      const requestPayload = {
        contents: [
          { role: 'user', parts: [{ text: system }] },
          ...conversationHistory,
          {
            role: 'user',
            parts: [
              { text: user },
              ...imagePart,
              ...fileParts
            ]
          }
        ]
      };
  
      // Stringify with a replacer to handle circular references
      const payloadString = JSON.stringify(requestPayload, getCircularReplacer());
  
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDckR-YVG5ghGYo2LBu7okmpp2eqxVWLQY`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payloadString
        }
      );
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
  
      const data = await response.json();
      const rawResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                          "Sorry, I couldn't process your request.";
      console.log(rawResponse)
      const parsedResponse = parseStructuredResponse(rawResponse);
  
      addChatMessage({
        role: 'assistant',
        content: {
          title: 'Assistant',
          content: parsedResponse.content || parsedResponse,
          actions: parsedResponse.actions || [],
          links: parsedResponse.links || [],
          ...(files.length > 0 && { files: files.map(f => f.name) })
        }
      });
  
      setFiles([]);
      setImageUrl(null);
      setImageData(null);
      setSnippetImage(null);
  
    } catch (error) {
      console.error('Error sending message:', error);
      addChatMessage({
        role: 'assistant',
        content: {
          title: 'Error',
          content: `I encountered an error: ${error.message}`,
          actions: [
            "Check your internet connection",
            "Try again with smaller files",
            "Contact support if it persists"
          ],
          links: []
        }
      });
      addLog(`API Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Helper function to handle circular references
  const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };
  
const extractTextFromFile = (file) => {
  return new Promise((resolve, reject) => {
    if (file.type === 'application/pdf') {
      // PDF.js would be needed here for real PDF extraction
      resolve("[PDF content - would need PDF.js implementation]");
    } else if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    } else {
      resolve(`[Content of ${file.name} cannot be extracted directly]`);
    }
  });
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 5. Update your loading state rendering:
{isProcessing && (
  <Message 
    role="assistant"
    content={{
      title: 'Assistant',
      content: 'Thinking...',
      actions: [],
      links: []
    }}
  />
)}

  // Helper function
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - (isOpen ? 350 : 60)),
        y: Math.min(prev.y, window.innerHeight - (isOpen ? 500 : 60))
      }));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Drag event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', smoothDrag);
      window.addEventListener('mouseup', handleDragEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', smoothDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isDragging, smoothDrag, handleDragEnd]);

  return (
    <div
      ref={containerRef}
      className="absolute"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : isOpen ? 'default' : 'grab',
        transform: isDragging ? 'scale(1.05)' : 'none',
        transition: isDragging ? 'none' : 'transform 0.2s ease',
        width: isOpen ? '400px' : '50px',
        height: isOpen ? '500px' : '50px',
        borderRadius: isOpen ? '12px' : '50%',
        backgroundColor: isOpen ? '#1F1F1F' : '#4a6bff',  // Dark gray background for open, soft blue for minimized
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: isOpen ? 'flex-start' : 'center',
        border: '1px solid #A3A3A3',  // border with gray color (gray-400/70)
      }}
      onMouseDown={handleDragStart}
      onMouseUp={() => {
        if (dragStartTimeout.current) {
          clearTimeout(dragStartTimeout.current);
        }
      }}
      onClick={!isOpen ? toggleChat : undefined}
    >
      {isOpen && chat ? (
        <div className="flex flex-col w-full h-full p-4">
          <ChatHeader onClose={toggleChat} className="text-white" />
  
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 text-white">
            {/* <ActivityLog logs={logs} /> */}
            <MessageList messages={chatHistory} isProcessing={isProcessing} />
            <FilePreview files={files} snippetImage={snippetImage} />
          </div>
  
          <ChatInput
            message={message}
            setMessage={setMessage}
            onSend={sendMessage}
            onFileUpload={(e) => {
              const newFiles = Array.from(e.target.files);
              setFiles((prev) => [...prev, ...newFiles]);
              addLog(`Uploaded ${newFiles.length} file(s)`);
            }}
            className="bg-neutral-800 text-white placeholder-gray-400"
          />
        </div>
      ) : (
        <FaRobot size={30} color="white" />
      )}
  
      {isSnippetOpen && (
        <SnippetTool
          onClose={() => setIsSnippetOpen(false)}
          onCapture={(image) => {
            setSnippetImage(image);
            setIsSnippetOpen(false);
            setIsOpen(true);
          }}
          setIsOpen={setIsOpen}
          setChat={setChat}
          triggerSnipping={isSnippetOpen}
          className="bg-neutral-800"
        />
      )}
    </div>
  );
  
  
};

export default WebBot;