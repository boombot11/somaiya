export const generatePrompt = (message, logs, chatHistory, files) => {
    // Extract relevant context from logs
    const recentLogs = logs.slice(-3).map(log => 
      `${new Date(log.timestamp).toLocaleTimeString()}: ${log.action}`
    ).join('\n');
  
    // Format chat history for context
    const historyContext = chatHistory.slice(-4).map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');
  
    // File context if any files are attached
    const fileContext = files.length > 0 ? 
      `\nAttached Files: ${files.map(f => f.name).join(', ')}` : '';
  
    // System instructions with enhanced formatting
    const systemInstructions = `
    You are an AI assistant embedded in a Financial tax filling analysis web applications. Follow these guidelines:
    
    Keep all responses of the financial terms , document summaries ,optimizing strategies or any other content short, clear, and helpful for a non-expert. Here's the data to analyze:

    1. RESPONSE FORMAT:
    - Always respond in this EXACT format:
      [TITLE] Brief title of response
      [CONTENT] Detailed explanation/content
      [ACTIONS] (if applicable) Suggested actions as bullet points
      [LINKS] (if applicable) Relevant links or references
    
    2. CONTEXT:
    - Recent User Activity:
    ${recentLogs}
    
    - Conversation History:
    ${historyContext}
    
    3. SPECIAL CASES:
    - For code: Use markdown code blocks with language specification
    - For data: Present in clear tables when possible
    - For errors: Provide troubleshooting steps
    ${fileContext}
    `;
  
    return {
      system: systemInstructions,
      user: message
    };
  };
  
  // Helper to parse the structured response
  export const parseStructuredResponse = (text) => {
    const sections = {
      title: '',
      content: '',
      actions: [],
      links: []
    };
  
    // Extract title
    const titleMatch = text.match(/\[TITLE\](.*?)(?=\[CONTENT\]|$)/s);
    if (titleMatch) sections.title = titleMatch[1].trim();
  
    // Extract content
    const contentMatch = text.match(/\[CONTENT\](.*?)(?=\[ACTIONS\]|\[LINKS\]|$)/s);
    if (contentMatch) sections.content = contentMatch[1].trim();
  
    // Extract actions
    const actionsMatch = text.match(/\[ACTIONS\](.*?)(?=\[LINKS\]|$)/s);
    if (actionsMatch) {
      sections.actions = actionsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-/, '').trim());
    }
  
    // Extract links
    const linksMatch = text.match(/\[LINKS\](.*?)$/s);
    if (linksMatch) {
      sections.links = linksMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-/, '').trim());
    }
  
    // Fallback for non-structured responses
    if (!sections.title && !sections.content) {
      return {
        title: 'Assistant Response',
        content: text,
        actions: [],
        links: []
      };
    }
  
    return sections;
  };