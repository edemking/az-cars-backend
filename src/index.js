const path = require("path"); // you already import it below; keep one import only
const envPath = path.resolve(__dirname, "..", ".env");
require("dotenv").config({ path: envPath });
console.log("Using .env at:", envPath);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
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
// Normalize origins: lowercase, strip trailing slashes, remove zero-width spaces
const normalizeOrigin = (s) => {
  const cleaned = s
    .replace(/\u200B/g, "")
    .replace(/\/+$/, "")
    .toLowerCase();
  try {
    // If it's a standard URL, normalize to protocol//host
    const u = new URL(cleaned);
    return `${u.protocol}//${u.host}`;
  } catch {
    // For custom schemes like azcars:// just return cleaned
    return cleaned;
  }
};

const ALLOWED_ORIGINS_RAW = [
  "https://main.dr6pagvri9whk.amplifyapp.com",
  "https://auction.azcarsae.com",
];
const ALLOWED_SET = new Set(ALLOWED_ORIGINS_RAW.map(normalizeOrigin));

// Debug what the server thinks the allowlist is
console.log("CORS allowlist:", [...ALLOWED_SET]);

// If you're behind Nginx/ALB/Cloudflare, enable this so cookies + SameSite=None behave
app.set("trust proxy", 1);

// TEMP debug – logs any mismatched origins hitting the API
app.use((req, _res, next) => {
  const o = req.headers.origin;
  if (o && !ALLOWED_SET.has(normalizeOrigin(o))) {
    console.warn(
      `[CORS] Blocked Origin: ${o} -> ${req.method} ${req.originalUrl}`
    );
  }
  next();
});

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // non-browser or same-origin
    const ok = ALLOWED_SET.has(normalizeOrigin(origin));
    return cb(null, ok); // do NOT throw — just say "not allowed"
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  exposedHeaders: ["Authorization"],
  optionsSuccessStatus: 204,
};

// Apply CORS for all routes + preflight (only once)
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ---------- Socket.IO ----------
const io = socketIo(server, {
  path: "/socket.io",
  cors: {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const ok = ALLOWED_SET.has(normalizeOrigin(origin));
      return cb(null, ok); // again, no thrown Error
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"], // explicit for engine.io preflights
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
