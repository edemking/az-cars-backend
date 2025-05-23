const User = require('../models/User');
const { generatePassword } = require('../utils/passwordGenerator');
const emailService = require('../utils/emailService');
const { getFileUrl } = require('../utils/fileUpload');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('role');
    sendSuccess(res, {
      data: users
    });
  } catch (error) {
    sendError(res, { message: error.message });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('role');
    
    if (!user) {
      return sendError(res, {
        statusCode: 404,
        message: 'User not found'
      });
    }
    sendSuccess(res, {
      data: user
    });
  } catch (error) {
    sendError(res, { message: error.message });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const userData = req.body;
    
    // Handle file uploads for ID documents
    if (req.files) {
      // Process ID Front
      if (req.files.idFront && req.files.idFront.length > 0) {
        userData.idFront = getFileUrl(req, req.files.idFront[0]);
      }
      
      // Process ID Back
      if (req.files.idBack && req.files.idBack.length > 0) {
        userData.idBack = getFileUrl(req, req.files.idBack[0]);
      }
    }
    
    // Check if both ID documents are provided
    // if (!userData.idFront || !userData.idBack) {
    //   return sendError(res, {
    //     statusCode: 400,
    //     message: 'Both front and back ID documents are required'
    //   });
    // }
    
    // Generate a random password
    const generatedPassword = generatePassword(12);
    userData.password = generatedPassword;
    
    const user = new User(userData);
    const newUser = await user.save();
    
    // Send welcome email with credentials
    await emailService.sendWelcomeEmail(
      newUser.email,
      generatedPassword,
      newUser.firstName
    );
    
    // Return user with the generated password (only upon creation)
    const userResponse = newUser.toObject();
    userResponse.plainPassword = generatedPassword; // Include the non-hashed password in the response
    
    // Remove hashed password from response
    delete userResponse.password;
    
    sendSuccess(res, {
      statusCode: 201,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    sendError(res, {
      statusCode: 400,
      message: error.message
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent password updates through this endpoint
    if (updates.password) {
      delete updates.password;
    }
    
    // Handle file uploads for ID documents
    if (req.files) {
      // Process ID Front
      if (req.files.idFront && req.files.idFront.length > 0) {
        updates.idFront = getFileUrl(req, req.files.idFront[0]);
      }
      
      // Process ID Back
      if (req.files.idBack && req.files.idBack.length > 0) {
        updates.idBack = getFileUrl(req, req.files.idBack[0]);
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return sendError(res, {
        statusCode: 404,
        message: 'User not found'
      });
    }
    sendSuccess(res, {
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    sendError(res, {
      statusCode: 400,
      message: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return sendError(res, {
        statusCode: 404,
        message: 'User not found'
      });
    }
    sendSuccess(res, {
      message: 'User deleted successfully'
    });
  } catch (error) {
    sendError(res, { message: error.message });
  }
}; 