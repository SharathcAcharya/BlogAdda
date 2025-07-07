import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, token } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection handlers
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });

      // Real-time notification handlers
      newSocket.on('new_notification', (notification) => {
        toast.success(notification.message, {
          duration: 5000,
          icon: '🔔',
        });
      });

      // Blog comment handlers
      newSocket.on('comment_added', (commentData) => {
        // Handle new comment in real-time
        console.log('New comment added:', commentData);
      });

      newSocket.on('comment_like_updated', (likeData) => {
        // Handle comment like update
        console.log('Comment like updated:', likeData);
      });

      // Blog like handlers
      newSocket.on('blog_like_updated', (likeData) => {
        // Handle blog like update in real-time
        console.log('Blog like updated:', likeData);
      });

      // Online users handler
      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      // User joined/left handlers
      newSocket.on('user_joined', (userData) => {
        setOnlineUsers(prev => [...prev, userData]);
      });

      newSocket.on('user_left', (userId) => {
        setOnlineUsers(prev => prev.filter(user => user.id !== userId));
      });

      // Typing indicators (for future chat feature)
      newSocket.on('user_typing', (data) => {
        console.log('User typing:', data);
      });

      newSocket.on('user_stopped_typing', (data) => {
        console.log('User stopped typing:', data);
      });

      // Error handlers
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(error.message || 'Connection error');
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      };
    }
  }, [user, token]);

  // Socket utility functions
  const joinBlogRoom = (blogId) => {
    if (socket && isConnected) {
      socket.emit('join_blog', blogId);
    }
  };

  const leaveBlogRoom = (blogId) => {
    if (socket && isConnected) {
      socket.emit('leave_blog', blogId);
    }
  };

  const emitNewComment = (commentData) => {
    if (socket && isConnected) {
      socket.emit('new_comment', commentData);
    }
  };

  const emitCommentLike = (likeData) => {
    if (socket && isConnected) {
      socket.emit('comment_liked', likeData);
    }
  };

  const emitTyping = (blogId, isTyping) => {
    if (socket && isConnected) {
      if (isTyping) {
        socket.emit('typing', { blogId });
      } else {
        socket.emit('stop_typing', { blogId });
      }
    }
  };

  const sendMessage = (message) => {
    if (socket && isConnected) {
      socket.emit('message', message);
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinBlogRoom,
    leaveBlogRoom,
    emitNewComment,
    emitCommentLike,
    emitTyping,
    sendMessage,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
