require('dotenv').config({ path: '.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const config = require('./config/config');
const connectDB = require('./config/db');
const { sendError, sendSuccess } = require('./utils/responseHandler');

// Initialize Express app
const app = express();

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:8081',
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods', 'ngrok-skip-browser-warning', 'X-Requested-With'],
  }
});

// Make io available globally
global.io = io;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join auction room for real-time updates
  socket.on('join-auction', (auctionId) => {
    socket.join(`auction-${auctionId}`);
    console.log(`Client ${socket.id} joined auction room: auction-${auctionId}`);
  });

  // Leave auction room
  socket.on('leave-auction', (auctionId) => {
    socket.leave(`auction-${auctionId}`);
    console.log(`Client ${socket.id} left auction room: auction-${auctionId}`);
  });

  // Join user room for notifications
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`Client ${socket.id} joined user room: user-${userId}`);
  });

  // Leave user room
  socket.on('leave-user', (userId) => {
    socket.leave(`user-${userId}`);
    console.log(`Client ${socket.id} left user room: user-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Define allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:8081',
      // Add your production domain here
      process.env.FRONTEND_URL,
      // Allow any localhost with any port for development
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/
    ].filter(Boolean); // Remove undefined values
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods', 'ngrok-skip-browser-warning', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Welcome route
app.get('/', (req, res) => {
  sendSuccess(res, {
    message: 'Welcome to the AZ Cars API'
  });
});

// Import routes
const carRoutes = require('./routes/cars');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const roleRoutes = require('./routes/roles');
const notificationRoutes = require('./routes/notifications');

// Use routes
app.use('/api/cars', carRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  sendError(res, {
    statusCode: err.statusCode || 500,
    message: err.message || 'Something went wrong on the server',
    errors: err.errors
  });
});

// Start server
const PORT = config.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.IO enabled for real-time communications');
}); 
