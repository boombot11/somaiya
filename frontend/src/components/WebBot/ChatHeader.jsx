import React from 'react';
import { FaTimes } from 'react-icons/fa';

const ChatHeader = ({ onClose }) => (
  <div className="text-bold text-2xl" style={{
    padding: '12px 16px',
    backgroundColor: 'transparent',
    textDecoration: 'bold',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'move'
  }}>
    <h3 className='pr-6' style={{ margin: 0, fontSize: '16px',zIndex:49 }}>AI Assistant</h3>
    <button 
      className="close-button no-drag"
      style={{
        background: 'none',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: '16px'
      }}
      onClick={onClose}
    >
      <FaTimes className="h-5 z-50 w-5"/>
    </button>
  </div>
);

export default ChatHeader;