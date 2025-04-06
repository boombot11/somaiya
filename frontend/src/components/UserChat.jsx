import React, { useState, useEffect } from 'react';
import { FaCamera, FaPaperclip } from 'react-icons/fa';
import { supabase } from './supabaseClient'; // Assuming supabaseClient.js contains supabase client

const UserChat = () => {
  const [user, setUser] = useState('test');
  const [consultants, setConsultants] = useState([
    { name: "Consultant A", rating: 4.5 },
    { name: "Consultant B", rating: 4.8 },
    { name: "Consultant C", rating: 4.2 }
  ]);
  const [selectedConsultant, setSelectedConsultant] = useState(null); // The selected consultant state
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [triggerSnipping, setTriggerSnipping] = useState(false);
  const fileInputRef = React.useRef();

  // Load previous messages when consultant is selected
  useEffect(() => {
    if (selectedConsultant) {
      loadPreviousMessages();
      listenToMessages();
    }
  }, [selectedConsultant]); // Listen to messages when selectedConsultant changes

  // Load previous messages from the database
  const loadPreviousMessages = async () => {
    if (!selectedConsultant) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender.eq.${user},receiver.eq.${user}`)
      .order('sent_at');

    if (error) console.error("Load messages error:", error);
    else {
      setMessages(data); // Set the loaded messages to the state
    }
  };

  // Subscribe to messages in real-time
  const listenToMessages = () => {
    if (!selectedConsultant) return;

    supabase
      .channel('user-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver=eq.${user}`,
      }, payload => {
        // Display the incoming message immediately
        displayMessage(payload.new);
      })
      .subscribe();
  };

  // Send the message to the database and update state immediately
  const sendMessage = async () => {
    if (!message.trim()) return;

    // Update the state to display the message immediately
    const newMessage = { sender: user, receiver: selectedConsultant.name, content: message, sent_at: new Date() };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Insert the new message into the database
    const { error } = await supabase.from('messages').insert([newMessage]);
    if (error) console.error("Send message error:", error);

    setMessage(''); // Clear input field after sending
  };

  // Function to append the new message to the messages state
  const displayMessage = (msg) => {
    setMessages((prevMessages) => [...prevMessages, msg]); // Append the new message to the chat
  };

  // Handle selecting a consultant
  const handleConsultantClick = async (consultant) => {
    setSelectedConsultant(consultant); // Set the selected consultant

    // Send a chat request to the consultant
    const { error } = await supabase
      .from('chat_requests')
      .insert([{ sender: user, receiver: consultant.name }]);

    if (error) console.error("Error sending chat request:", error);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Consultant Cards */}
      {!selectedConsultant ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {consultants.map((consultant, idx) => (
            <div
              key={idx}
              className="border border-gray-300 bg-white/70 p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300"
              onClick={() => handleConsultantClick(consultant)}
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{consultant.name}</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300">Rating: {consultant.rating}</p>
            </div>
          ))}
        </div>
      ) : (
        // Chat Area
        <div>
          <h3 className="text-2xl text-white  font-bold mb-4 text-gray-800 dark:text-white">
            Chat with {selectedConsultant.name}
          </h3>
          
          {/* Message Display Area */}
          <div
            id="messages"
            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-h-80 overflow-y-auto mb-6 border border-gray-300 dark:border-gray-600"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className="mb-4">
                <p className="font-semibold text-gray-800 dark:text-white">
                  {msg.sender}:
                </p>
                <p className="text-gray-700 dark:text-gray-300">{msg.content}</p>
              </div>
            ))}
          </div>
          
          {/* Input and Action Buttons */}
          <div className="flex gap-4 items-center w-full">
            {/* Message Input */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message..."
              className="flex-1 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            
            {/* File Attachment Button */}
            <button
              onClick={() => fileInputRef.current.click()}
              className="text-gray-600 dark:text-white focus:outline-none hover:text-blue-500 transition duration-300"
            >
              <FaPaperclip />
            </button>
  
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.csv,.txt"
              multiple
              className="hidden"
            />
  
            {/* Snipping Tool Button */}
            <button
              onClick={() => setTriggerSnipping(true)}
              className="text-gray-600 dark:text-white focus:outline-none hover:text-blue-500 transition duration-300"
            >
              <FaCamera />
            </button>
  
            {/* Send Button */}
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none transition duration-300"
            >
              Send
            </button>
          </div>
  
          {/* Snipping tool logic */}
        </div>
      )}
    </div>
  );
};

export default UserChat;
