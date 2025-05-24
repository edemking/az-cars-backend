require('dotenv').config({ path: '.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const connectDB = require('./config/db');
const { sendError, sendSuccess } = require('./utils/responseHandler');



// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true, // Allow credentials (cookies, authorization headers, etc)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Use routes
app.use('/api/cars', carRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/roles', roleRoutes);

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 