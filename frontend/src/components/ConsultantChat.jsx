import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient'; // Assuming supabaseClient.js contains supabase client
import { FaPaperclip, FaCamera } from 'react-icons/fa'; // Assuming these are imported for the icons

const ConsultantChat = () => {
  const [consultants, setConsultants] = useState([
    { name: "Consultant A", rating: 4.5 },
    { name: "Consultant B", rating: 4.8 },
    { name: "Consultant C", rating: 4.2 }
  ]);
  const [selectedConsultant, setSelectedConsultant] = useState(null); // Selected consultant state
  const [user, setUser] = useState(null); // Selected user
  const [users, setUsers] = useState([]); // Users who have sent chat requests
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // Store the messages
  const fileInputRef = useRef(null); // For file input handling
  const [triggerSnipping, setTriggerSnipping] = useState(false); // To handle snipping tool state

  useEffect(() => {
    let intervalId;  // Variable to store the interval ID

    // Load chat requests and previous messages when a consultant is selected
    if (selectedConsultant) {
      loadChatRequests();
      loadPreviousMessages(user);
      listenToMessages();

      // Set up the interval to refresh data every 3 seconds
      intervalId = setInterval(() => {
        loadPreviousMessages(user);
        listenToMessages();
      }, 3000); // 3000ms = 3 seconds
    }

    // Clean up the interval when the component unmounts or when dependencies change
    return () => {
      if (intervalId) {
        clearInterval(intervalId);  // Clear the interval when unmounting or on dependency change
      }
    };
  }, [selectedConsultant, user]); // The effect runs when the selected consultant or user changes

  // Load the chat requests for the selected consultant
  const loadChatRequests = async () => {
    if (!selectedConsultant) return;

    const { data, error } = await supabase
      .from('chat_requests')
      .select('sender')
      .eq('receiver', selectedConsultant.name);

    if (error) {
      console.error("Error loading chat requests:", error);
    } else {
      // Filter out duplicate senders
      const uniqueUsers = [...new Set(data.map(req => req.sender))];
      setUsers(uniqueUsers); // Store the unique users who sent chat requests
      console.log("Loaded chat requests for", selectedConsultant.name, uniqueUsers);
    }
  };

  // Load previous messages between the selected consultant and the user
  const loadPreviousMessages = async (user) => {
    // Check if selectedConsultant and user are defined
    if (!selectedConsultant || !user) return;

    console.log("Load prev msg ka user:  ", user);

    // Ensure both `user` and `selectedConsultant` are strings and use template literals for the query.
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender.eq.${user},receiver.eq.${selectedConsultant.name},sender.eq.${selectedConsultant.name},receiver.eq.${user}`)
      .order('sent_at');

    if (data) {
        // Combine both directions of messages and sort by the sent_at timestamp.
        const combinedMessages = data.sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
        
        setMessages(combinedMessages);
        console.log("Loaded previous messages:", combinedMessages);
        console.log("Loaded previous messages for", selectedConsultant.name, "and user", user, combinedMessages);
    }

    if (error) {
        console.error("Load messages error:", error);
    }
};

  const listenToMessages = () => {
    if (!selectedConsultant || !user) return;

    // Subscribe to messages where either the consultant or the user is involved
    supabase
      .channel('consultant-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver=eq.${user},sender=eq.${selectedConsultant.name}` // Listen for both directions (consultant <-> user)
      }, payload => {
        // Display the incoming message immediately
        displayMessage(payload.new);
        console.log("New message received:", payload.new);
      })
      .subscribe();
  };

  const displayMessage = (msg) => {
    setMessages((prevMessages) => [...prevMessages, msg]); // Append the new message to the messages list
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    console.log("Sending message:", message);
    // Send the message from consultant to user
    await supabase.from('messages').insert([{ sender: selectedConsultant.name, receiver: user, content: message }]);
    setMessage(''); // Clear the input after sending
  };

  const handleConsultantClick = (consultant) => {
    console.log("Consultant clicked:", consultant);
    setSelectedConsultant(consultant); // Set selected consultant
    setUser(null); // Reset selected user when consultant changes
    setMessages([]); // Reset messages
    console.log("Consultant selected:", consultant);
  };

  const handleUserSelect = (selectedUser) => {
    setUser(selectedUser); // Set selected user
    loadPreviousMessages(selectedUser); // Load previous messages with the selected user
    listenToMessages(); // Start listening for new messages
    console.log("User selected:", selectedUser);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
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
        // Consultant Chat Section
        <div>
          <h3 className="text-2xl font-bold mb-4">Chat as {selectedConsultant.name}</h3>
  
          {/* User Dropdown */}
          {!user ? (
            <div className="mb-6">
              <h4 className="text-xl font-semibold mb-2">Select a User to Chat With:</h4>
              <select
                onChange={(e) => {
                  const selectedUser = e.target.value;
                  handleUserSelect(selectedUser);
                }}
                className="p-3 w-full md:w-1/2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a User --</option>
                {users.map((user, idx) => (
                  <option key={idx} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            // Chat Area
            <div>
              <h3 className="text-2xl font-semibold mb-4">Chat with {user}</h3>
              <div
                id="messages"
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-h-80 overflow-y-auto mb-6 border border-gray-300 dark:border-gray-600"
              >
                {/* Display messages between the consultant and the user */}
                {messages.map((msg, idx) => (
                  <div key={idx} className="mb-4">
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {msg.sender}:
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">{msg.content}</p>
                  </div>
                ))}
              </div>
  
              {/* Input area for typing message */}
              <div className="flex gap-4 items-center w-full">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type message..."
                  className="flex-1 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
  
                {/* Attach file */}
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="text-gray-600 dark:text-white focus:outline-none hover:text-blue-500 transition duration-300"
                >
                  <FaPaperclip />
                </button>
  
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.csv,.txt"
                  multiple
                  className="hidden"
                />
  
                {/* Snipping tool button */}
                <button
                  onClick={() => setTriggerSnipping(true)}
                  className="text-gray-600 dark:text-white focus:outline-none hover:text-blue-500 transition duration-300"
                >
                  <FaCamera />
                </button>
  
                {/* Send button */}
                <button
                  onClick={() => {
                    sendMessage();
                    console.log("Send button clicked");
                  }}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none transition duration-300"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsultantChat;
