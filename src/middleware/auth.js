const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { Role } = require("../models/Role");
const config = require("../config/config");
const { sendError } = require('../utils/responseHandler');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;
  
  // Check if Authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Get token from header (format: "Bearer <token>")
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    return sendError(res, {
      statusCode: 401,
      message: "Not authorized to access this route"
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Add user from payload to request object, including role
    req.user = await User.findById(decoded.id)
      .select("-password")
      .populate('role');

    if (!req.user) {
      return sendError(res, {
        statusCode: 401,
        message: "User not found"
      });
    }

    next();
  } catch (error) {
    return sendError(res, {
      statusCode: 401,
      message: "Not authorized to access this route"
    });
  }
};

// Middleware to check for specific permissions
exports.hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      // If no user or role, deny access
      if (!req.user || !req.user.role) {
        return sendError(res, {
          statusCode: 403,
          message: "Access denied: No role assigned"
        });
      }

      // Check if user's role has the required permission
      if (req.user.role.permissions.includes(permission)) {
        return next();
      }

      return sendError(res, {
        statusCode: 403,
        message: `Access denied: '${permission}' permission required`
      });
    } catch (error) {
      return sendError(res, {
        statusCode: 500,
        message: "Error checking permissions",
        errors: error.message
      });
    }
  };
};

