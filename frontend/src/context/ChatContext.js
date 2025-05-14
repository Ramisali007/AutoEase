import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';
import ChatService from '../services/chat.service';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});

  // Initialize Socket.IO connection
  useEffect(() => {
    if (currentUser) {
      const socketInstance = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        withCredentials: true,
        path: '/socket.io/',
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        console.log('Connected to chat server');
        socketInstance.emit('authenticate', currentUser._id);
      });

      socketInstance.on('receive_message', (data) => {
        console.log('Received message:', data);

        // Add message to state if it's from the active chat
        if (activeChat && data.senderId === activeChat._id) {
          setMessages(prev => [...prev, {
            sender: { _id: data.senderId },
            receiver: { _id: currentUser._id },
            message: data.message,
            createdAt: data.timestamp,
            isRead: false,
            _id: `temp-${Date.now()}`
          }]);

          // Mark as read if chat is active
          ChatService.markAsRead(data.senderId).catch(err => {
            console.error('Error marking messages as read:', err);
          });
        } else {
          // Update unread count for this sender
          setUnreadCounts(prev => ({
            ...prev,
            [data.senderId]: (prev[data.senderId] || 0) + 1
          }));
        }
      });

      socketInstance.on('user_typing', ({ senderId }) => {
        setTypingUsers(prev => ({ ...prev, [senderId]: true }));
      });

      socketInstance.on('user_stop_typing', ({ senderId }) => {
        setTypingUsers(prev => ({ ...prev, [senderId]: false }));
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [currentUser, activeChat]);

  // Use refs to track if data has been loaded
  const adminsLoaded = useRef(false);
  const usersLoaded = useRef(false);
  const hostsLoaded = useRef(false);
  const countsLoaded = useRef(false);

  // Load admins and users on initial render
  useEffect(() => {
    const loadInitialData = async () => {
      if (currentUser) {
        if (!adminsLoaded.current) {
          await loadAdmins();
          adminsLoaded.current = true;
        }

        if (!countsLoaded.current) {
          await loadUnreadCounts();
          countsLoaded.current = true;
        }

        // Load users if current user is a host
        if (currentUser.role === 'host' && !usersLoaded.current) {
          await loadUsers();
          usersLoaded.current = true;
        }

        // Load hosts if current user is a regular user
        if (currentUser.role === 'user' && !hostsLoaded.current) {
          await loadHosts();
          hostsLoaded.current = true;
        }
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat && currentUser) {
      loadMessages(activeChat._id);
    }
  }, [activeChat, currentUser]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const adminData = await ChatService.getAdmins();
      console.log('Admin data received:', adminData);

      // ChatService now handles the response format and returns the array directly
      if (Array.isArray(adminData)) {
        console.log('Setting admins array:', adminData);
        setAdmins(adminData);
      } else {
        console.error('Unexpected admin data format:', adminData);
        setAdmins([]);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userData = await ChatService.getUsersForHost();
      console.log('User data received for host:', userData);

      // ChatService now handles the response format and returns the array directly
      if (Array.isArray(userData)) {
        console.log('Setting users array:', userData);
        setUsers(userData);
      } else {
        console.error('Unexpected user data format:', userData);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users for host:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHosts = async () => {
    try {
      setLoading(true);
      const hostData = await ChatService.getHostsForUser();
      console.log('Host data received for user:', hostData);

      // ChatService now handles the response format and returns the array directly
      if (Array.isArray(hostData)) {
        console.log('Setting hosts array:', hostData);
        setHosts(hostData);
      } else {
        console.error('Unexpected host data format:', hostData);
        setHosts([]);
      }
    } catch (error) {
      console.error('Error loading hosts for user:', error);
      setHosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCounts = async () => {
    try {
      // This would ideally be a batch API call to get all unread counts
      // For now, we'll just get the total
      const response = await ChatService.getUnreadCount();
      // In a real implementation, you'd get counts per user
      setUnreadCounts({ total: response.count });
    } catch (error) {
      console.error('Error loading unread counts:', error);
    }
  };

  const loadMessages = async (userId) => {
    try {
      setLoading(true);
      const response = await ChatService.getConversation(userId);
      setMessages(response.data);

      // Mark messages as read
      await ChatService.markAsRead(userId);

      // Update unread counts
      setUnreadCounts(prev => ({
        ...prev,
        [userId]: 0
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (receiverId, message) => {
    try {
      // Optimistically add message to UI
      const tempMessage = {
        sender: { _id: currentUser._id, name: currentUser.name, profileImage: currentUser.profileImage },
        receiver: { _id: receiverId },
        message,
        createdAt: new Date(),
        isRead: false,
        _id: `temp-${Date.now()}`
      };

      setMessages(prev => [...prev, tempMessage]);

      // Send via Socket.IO for real-time delivery
      if (socket) {
        socket.emit('send_message', {
          senderId: currentUser._id,
          receiverId,
          message
        });
      }

      // Also send via API for persistence
      const response = await ChatService.sendMessage(receiverId, message);

      // Replace temp message with real one
      setMessages(prev => prev.map(msg =>
        msg._id === tempMessage._id ? response.data : msg
      ));

      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const sendTypingIndicator = (receiverId, isTyping) => {
    if (socket && receiverId) {
      socket.emit(isTyping ? 'typing' : 'stop_typing', {
        senderId: currentUser._id,
        receiverId
      });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        activeChat,
        setActiveChat,
        messages,
        unreadCounts,
        admins,
        users,
        hosts,
        loading,
        sendMessage,
        sendTypingIndicator,
        typingUsers,
        loadMessages,
        loadUsers,
        loadHosts
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
