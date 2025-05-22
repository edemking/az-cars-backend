require('dotenv').config({ path: '.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const connectDB = require('./config/db');



// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the AZ Cars API');
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
  res.status(500).send('Something broke!');
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 