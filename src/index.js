require("dotenv").config({ path: ".env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const config = require("./config/config");
const connectDB = require("./config/db");
const { sendError, sendSuccess } = require("./utils/responseHandler");

// Initialize Express app
const app = express();

// Create HTTP server (must be before Socket.IO)
const server = http.createServer(app);

// ---------- CORS (single source of truth) ----------
const parseOrigins = (raw) =>
  (raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const ALLOWED_ORIGINS = parseOrigins(process.env.FRONTEND_ORIGINS);

// Allow: specific list, plus no-origin (e.g., curl/postman)
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // non-browser or same-origin
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  // Let cors reflect what the browser asks for; don’t hardcode these.
  // allowedHeaders: undefined,
  // If you truly need to read response headers in JS, list them here:
  exposedHeaders: ["Authorization"],
  optionsSuccessStatus: 204,
};

// Apply CORS for all routes + preflight
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // <-- keep only ONE app.options

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Socket.IO ----------
const io = socketIo(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error(`Socket.IO CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  },
});

// Make io available globally
global.io = io;

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-auction", (auctionId) => {
    socket.join(`auction-${auctionId}`);
    console.log(`Client ${socket.id} joined auction-${auctionId}`);
  });

  socket.on("leave-auction", (auctionId) => {
    socket.leave(`auction-${auctionId}`);
    console.log(`Client ${socket.id} left auction-${auctionId}`);
  });

  socket.on("join-user", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`Client ${socket.id} joined user-${userId}`);
  });

  socket.on("leave-user", (userId) => {
    socket.leave(`user-${userId}`);
    console.log(`Client ${socket.id} left user-${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Connect to MongoDB
connectDB();

// Welcome route
app.get("/", (req, res) => {
  sendSuccess(res, {
    message: "Welcome to the AZ Cars API",
  });
});

// Import routes
const carRoutes = require("./routes/cars");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const auctionRoutes = require("./routes/auctions");
const roleRoutes = require("./routes/roles");
const notificationRoutes = require("./routes/notifications");

// Use routes
app.use("/api/cars", carRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  sendError(res, {
    statusCode: err.statusCode || 500,
    message: err.message || "Something went wrong on the server",
    errors: err.errors,
  });
});

// Start server
const PORT = config.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Socket.IO enabled for real-time communications");
});
