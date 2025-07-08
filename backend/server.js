const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const blogRoutes = require('./routes/blogs');
const commentRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/search');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { socketAuth } = require('./middleware/socketAuth');
const AnalyticsService = require('./services/AnalyticsService');

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    credentials: true
  }
});

// Make io accessible in routes
app.set('io', io);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased to 1000 requests for development
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    process.env.CLIENT_URL,
    process.env.ADMIN_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Analytics tracking middleware
app.use(AnalyticsService.trackingMiddleware());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'BlogAdda API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Socket.IO connection handling
io.use(socketAuth);

io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.userId}`);

  // Join user to their personal room for notifications
  socket.join(`user_${socket.userId}`);

  // Handle blog room joining
  socket.on('join_blog', (blogId) => {
    socket.join(`blog_${blogId}`);
    console.log(`📖 User ${socket.userId} joined blog ${blogId}`);
  });

  // Handle leaving blog room
  socket.on('leave_blog', (blogId) => {
    socket.leave(`blog_${blogId}`);
    console.log(`📖 User ${socket.userId} left blog ${blogId}`);
  });

  // Handle new comment
  socket.on('new_comment', (data) => {
    socket.to(`blog_${data.blogId}`).emit('comment_added', data);
  });

  // Handle comment like
  socket.on('comment_liked', (data) => {
    socket.to(`blog_${data.blogId}`).emit('comment_like_updated', data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`👋 User disconnected: ${socket.userId}`);
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
