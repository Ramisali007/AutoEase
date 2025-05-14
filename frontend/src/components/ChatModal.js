import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faPaperPlane, faSpinner, faUser, faCircle
} from '@fortawesome/free-solid-svg-icons';
import '../assets/ChatModal.css';

const ChatModal = ({ show, onClose, recipient }) => {
  const { currentUser } = useAuth();
  const {
    messages,
    sendMessage,
    loading,
    typingUsers,
    sendTypingIndicator
  } = useChat();

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    return () => {
      // Clean up typing indicator when component unmounts
      if (recipient && recipient._id) {
        sendTypingIndicator(recipient._id, false);
      }
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [recipient, typingTimeout, sendTypingIndicator]);

  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    // Handle typing indicator
    if (recipient && recipient._id) {
      sendTypingIndicator(recipient._id, true);

      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set new timeout to stop typing indicator after 2 seconds of inactivity
      const timeout = setTimeout(() => {
        sendTypingIndicator(recipient._id, false);
      }, 2000);

      setTypingTimeout(timeout);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !recipient || !recipient._id) {
      return;
    }

    try {
      setIsSending(true);
      await sendMessage(recipient._id, messageText.trim());
      setMessageText('');

      // Clear typing indicator
      sendTypingIndicator(recipient._id, false);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (!show) {
    return null;
  }

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal">
        <div className="chat-modal-header">
          <div className="chat-recipient-info">
            <div className="chat-recipient-avatar">
              {recipient.profileImage ? (
                <img
                  src={recipient.profileImage}
                  alt={recipient.name}
                  onClick={(e) => e.stopPropagation()}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/40?text=User';
                  }}
                  style={{ pointerEvents: 'none' }}
                />
              ) : (
                <FontAwesomeIcon icon={faUser} />
              )}
            </div>
            <div className="chat-recipient-details">
              <h3>{recipient.name || 'User'}</h3>
              {typingUsers[recipient._id] && (
                <div className="typing-indicator">
                  <span>typing</span>
                  <span className="typing-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </span>
                </div>
              )}
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="chat-modal-body" ref={chatBodyRef}>
          {loading ? (
            <div className="chat-loading">
              <FontAwesomeIcon icon={faSpinner} spin />
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="message-date-group">
                <div className="message-date-divider">
                  <span>{date}</span>
                </div>
                {dateMessages.map((message) => (
                  <div
                    key={message._id}
                    className={`message-bubble ${message.sender._id === currentUser._id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">{message.message}</div>
                    <div className="message-time">
                      {formatTime(message.createdAt)}
                      {message.sender._id === currentUser._id && (
                        <span className="message-status">
                          {message.isRead ? (
                            <FontAwesomeIcon icon={faCircle} className="read-icon" />
                          ) : (
                            <FontAwesomeIcon icon={faCircle} className="unread-icon" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-modal-footer" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={handleInputChange}
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!messageText.trim() || isSending}
            className="chat-send-btn"
          >
            {isSending ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
