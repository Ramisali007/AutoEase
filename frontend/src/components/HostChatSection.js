import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import ChatService from '../services/chat.service';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faSearch,
  faPaperPlane,
  faSpinner,
  faCircle,
  faEnvelope,
  faUserShield,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';
import '../assets/HostChatSection.css';

const HostChatSection = () => {
  const { currentUser } = useAuth();
  const {
    activeChat,
    setActiveChat,
    messages,
    sendMessage,
    typingUsers,
    sendTypingIndicator,
    loadMessages,
    admins,
    users,
    loading: chatLoading,
    loadUsers
  } = useChat();

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const hasLoadedUsers = useRef(false);

  // For debugging
  useEffect(() => {
    console.log('Admins in HostChatSection:', admins);
  }, [admins]);

  // For debugging users
  useEffect(() => {
    console.log('Users in HostChatSection:', users);
  }, [users]);

  // Load users when component mounts
  useEffect(() => {
    if (currentUser && currentUser.role === 'host' && !hasLoadedUsers.current) {
      loadUsers();
      hasLoadedUsers.current = true;
    }
  }, [currentUser, loadUsers]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle admin selection
  const handleAdminSelect = (admin) => {
    setActiveChat(admin);
    loadMessages(admin._id);
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setActiveChat(user);
    loadMessages(user._id);
  };

  // Handle message input change
  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    // Handle typing indicator
    if (activeChat && activeChat._id) {
      sendTypingIndicator(activeChat._id, true);

      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set new timeout to stop typing indicator after 2 seconds of inactivity
      const timeout = setTimeout(() => {
        sendTypingIndicator(activeChat._id, false);
      }, 2000);

      setTypingTimeout(timeout);
    }
  };

  // Handle message send
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !activeChat || !activeChat._id) {
      return;
    }

    try {
      setIsSending(true);
      await sendMessage(activeChat._id, messageText.trim());
      setMessageText('');

      // Clear typing indicator
      sendTypingIndicator(activeChat._id, false);
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

  // Format time for messages
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for messages
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Ensure admins is an array and has valid data
  const validAdmins = Array.isArray(admins) ? admins : [];

  // Add default admin if no admins are found
  const displayAdmins = validAdmins.length > 0 ? validAdmins : [
    {
      _id: 'default-admin',
      name: 'System Administrator',
      email: 'admin@autoease.com',
      profileImage: null,
      role: 'admin'
    }
  ];

  // Ensure users is an array and has valid data
  const validUsers = Array.isArray(users) ? users : [];

  // Filter admins based on search term
  const filteredAdmins = displayAdmins.filter(admin => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      (admin.name && admin.name.toLowerCase().includes(searchLower)) ||
      (admin.email && admin.email.toLowerCase().includes(searchLower))
    );
  });

  // Filter users based on search term
  const filteredUsers = validUsers.filter(user => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower))
    );
  });

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="host-chat-section">
      <div className="chat-sidebar">
        <div className="chat-search">
          <div className="search-input-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search administrators or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="chat-search-input"
            />
          </div>
        </div>

        <div className="chat-contacts-list">
          {chatLoading ? (
            <div className="chat-loading">
              <FontAwesomeIcon icon={faSpinner} spin />
              <p>Loading contacts...</p>
            </div>
          ) : (
            <>
              {/* Administrators Section */}
              {filteredAdmins.length > 0 && (
                <>
                  <div className="contact-category-header admin-header">
                    <FontAwesomeIcon icon={faUserShield} />
                    <span>Administrators</span>
                  </div>

                  {filteredAdmins.map(admin => (
                    <div
                      key={admin._id}
                      className={`chat-contact-item admin-item ${activeChat && activeChat._id === admin._id ? 'active' : ''}`}
                      onClick={() => handleAdminSelect(admin)}
                    >
                      <div className="chat-contact-avatar admin-avatar">
                        {admin.profileImage ? (
                          <img
                            src={admin.profileImage}
                            alt={admin.name}
                            onClick={(e) => e.stopPropagation()}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/40?text=Admin';
                            }}
                            style={{ pointerEvents: 'none' }}
                          />
                        ) : (
                          <FontAwesomeIcon icon={faUserTie} />
                        )}
                      </div>
                      <div className="chat-contact-info">
                        <h4>{admin.name || 'Administrator'}</h4>
                        <p>{admin.email || 'No Email'}</p>
                        <span className="contact-role admin-role">Admin</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Users Section */}
              {filteredUsers.length > 0 && (
                <>
                  <div className="contact-category-header user-header">
                    <FontAwesomeIcon icon={faUser} />
                    <span>Users</span>
                  </div>

                  {filteredUsers.map(user => (
                    <div
                      key={user._id}
                      className={`chat-contact-item user-item ${activeChat && activeChat._id === user._id ? 'active' : ''}`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="chat-contact-avatar user-avatar">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.name}
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
                      <div className="chat-contact-info">
                        <h4>{user.name || 'User'}</h4>
                        <p>{user.email || 'No Email'}</p>
                        <span className="contact-role user-role">User</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* No contacts found message */}
              {filteredAdmins.length === 0 && filteredUsers.length === 0 && (
                <div className="no-contacts-found">
                  <FontAwesomeIcon icon={faSearch} size="2x" style={{ marginBottom: '10px', opacity: 0.5 }} />
                  <p>No contacts found</p>
                  <p className="no-contacts-hint">Try a different search term or check back later</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="chat-main">
        {activeChat ? (
          <>
            <div className="chat-header">
              <div className="chat-admin-info">
                <div className="chat-admin-avatar">
                  {activeChat.profileImage ? (
                    <img
                      src={activeChat.profileImage}
                      alt={activeChat.name}
                      onClick={(e) => e.stopPropagation()}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/40?text=Admin';
                      }}
                      style={{ pointerEvents: 'none' }}
                    />
                  ) : (
                    <FontAwesomeIcon icon={faUserTie} />
                  )}
                </div>
                <div>
                  <h3>{activeChat.name || 'Administrator'}</h3>
                  <p>{activeChat.email || 'No Email'}</p>
                  {typingUsers[activeChat._id] && (
                    <div className="typing-indicator">
                      <span>typing</span>
                      <span className="typing-dots">
                        <span>.</span><span>.</span><span>.</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <FontAwesomeIcon icon={faEnvelope} size="3x" />
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

            <form className="chat-input" onSubmit={handleSendMessage}>
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
                className="send-button"
              >
                {isSending ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faPaperPlane} />
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <FontAwesomeIcon icon={faEnvelope} size="3x" />
            <h3>Select a contact to start chatting</h3>
            <p>Choose an administrator for support or a user to discuss bookings</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostChatSection;
