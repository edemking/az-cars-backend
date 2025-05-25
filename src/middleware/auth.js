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

// Middleware to check if user is accessing their own resource or is an admin
exports.ownerOrAdmin = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const currentUser = req.user;

    // Allow if user is accessing their own resource
    if (currentUser._id.toString() === userId) {
      return next();
    }

    // Allow if user has USER_ROLES_MANAGEMENT permission (admin)
    if (currentUser.role && currentUser.role.permissions.includes('User & Roles Management')) {
      return next();
    }

    return sendError(res, {
      statusCode: 403,
      message: "Access denied: You can only access your own resources"
    });
  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      message: "Error checking authorization",
      errors: error.message
    });
  }
};

// Middleware to check if user account is active
exports.checkAccountStatus = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, {
        statusCode: 401,
        message: "Authentication required"
      });
    }

    if (req.user.status === 'suspended') {
      return sendError(res, {
        statusCode: 403,
        message: "Account suspended: Please contact administrator"
      });
    }

    if (req.user.status === 'inactive') {
      return sendError(res, {
        statusCode: 403,
        message: "Account inactive: Please activate your account"
      });
    }

    next();
  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      message: "Error checking account status",
      errors: error.message
    });
  }
};

