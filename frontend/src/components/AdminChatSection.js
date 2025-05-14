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
  faHome,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';
import '../assets/AdminChatSection.css';

const AdminChatSection = () => {
  const { currentUser } = useAuth();
  const {
    activeChat,
    setActiveChat,
    messages,
    sendMessage,
    typingUsers,
    sendTypingIndicator,
    loadMessages
  } = useChat();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch all users and hosts from the database
  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        setLoading(true);
        // Get all users from the API using the proper API endpoint
        const response = await api.get('/admin/users');

        if (response.data && Array.isArray(response.data)) {
          console.log('Fetched users for chat:', response.data.length);

          // Filter out admin users, keep regular users and hosts
          const filteredUsers = response.data.filter(user => user.role !== 'admin');

          // Sort users by role (hosts first, then regular users)
          filteredUsers.sort((a, b) => {
            if (a.role === 'host' && b.role !== 'host') return -1;
            if (a.role !== 'host' && b.role === 'host') return 1;
            return 0;
          });

          setUsers(filteredUsers);
        } else {
          console.error('Invalid response format from users API:', response);
          setUsers([]);
        }

        // Get all conversations
        const conversationsData = await fetchConversations();
        setConversations(conversationsData);
      } catch (error) {
        console.error('Error fetching chat users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatUsers();
  }, []);

  // Fetch all conversations for the admin
  const fetchConversations = async () => {
    try {
      // This would be replaced with an actual API call to get all conversations
      // For now, we'll simulate it by getting conversations with each user
      const conversationsData = [];

      // In a real implementation, you would have an API endpoint to get all conversations
      // For now, we'll return an empty array
      return conversationsData;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.role && user.role.toLowerCase().includes(searchLower))
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
    <div className="admin-chat-section">
      <div className="chat-sidebar">
        <div className="chat-search">
          <div className="search-input-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search users or hosts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="chat-search-input"
            />
          </div>
        </div>

        <div className="chat-users-list">
          {loading ? (
            <div className="chat-loading">
              <FontAwesomeIcon icon={faSpinner} spin />
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <>
              {/* Display hosts first */}
              {filteredUsers.some(user => user.role === 'host') && (
                <div className="user-category-header">
                  <FontAwesomeIcon icon={faHome} />
                  <span>Hosts</span>
                </div>
              )}

              {/* Map hosts */}
              {filteredUsers
                .filter(user => user.role === 'host')
                .map(user => (
                  <div
                    key={user._id}
                    className={`chat-user-item ${activeChat && activeChat._id === user._id ? 'active' : ''} host-user`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="chat-user-avatar host-avatar">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          onClick={(e) => e.stopPropagation()}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40?text=Host';
                          }}
                          style={{ pointerEvents: 'none' }}
                        />
                      ) : (
                        <FontAwesomeIcon icon={faUserTie} />
                      )}
                    </div>
                    <div className="chat-user-info">
                      <h4>{user.name || 'Unknown Host'}</h4>
                      <p>{user.email || 'No Email'}</p>
                      <span className="user-role host-role">Host</span>
                    </div>
                  </div>
                ))}

              {/* Display regular users */}
              {filteredUsers.some(user => user.role === 'user') && (
                <div className="user-category-header">
                  <FontAwesomeIcon icon={faUser} />
                  <span>Users</span>
                </div>
              )}

              {/* Map regular users */}
              {filteredUsers
                .filter(user => user.role === 'user')
                .map(user => (
                  <div
                    key={user._id}
                    className={`chat-user-item ${activeChat && activeChat._id === user._id ? 'active' : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="chat-user-avatar">
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
                    <div className="chat-user-info">
                      <h4>{user.name || 'Unknown User'}</h4>
                      <p>{user.email || 'No Email'}</p>
                      <span className="user-role user-role">User</span>
                    </div>
                  </div>
                ))}
            </>
          ) : (
            <div className="no-users-found">
              <FontAwesomeIcon icon={faSearch} size="2x" style={{ marginBottom: '10px', opacity: 0.5 }} />
              <p>No users or hosts found</p>
              <p className="no-users-hint">Try a different search term or check back later</p>
            </div>
          )}
        </div>
      </div>

      <div className="chat-main">
        {activeChat ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="chat-user-avatar">
                  {activeChat.profileImage ? (
                    <img
                      src={activeChat.profileImage}
                      alt={activeChat.name}
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
                <div>
                  <h3>{activeChat.name || 'Unknown User'}</h3>
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
            <h3>Select a user to start chatting</h3>
            <p>Choose a user from the list to view your conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatSection;
