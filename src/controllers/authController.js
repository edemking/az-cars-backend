const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const emailService = require("../utils/emailService");
const bcrypt = require("bcryptjs");
const { sendSuccess, sendError } = require("../utils/responseHandler");

// Login user and get token
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return sendError(res, {
        statusCode: 400,
        message: "Please provide email and password",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).populate("role");

    if (!user) {
      return sendError(res, {
        statusCode: 401,
        message: "Invalid credentials",
      });
    }

    //Check if user already logged in
    if (user.loggedIn) {
      return sendError(res, {
        statusCode: 401,
        message: "User already logged in",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, {
        statusCode: 401,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE,
    });

    // Update User loggedIn boolean
    user.loggedIn = true;
    await user.save();

    sendSuccess(res, {
      statusCode: 200,
      message: "Login successful",
      data: {
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    sendError(res, { message: error.message });
  }
};

// Get current logged in user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("role");

    sendSuccess(res, {
      data: user,
    });
  } catch (error) {
    sendError(res, { message: error.message });
  }
};

// Generate and send OTP for password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, {
        statusCode: 400,
        message: "Please provide an email address",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, {
        statusCode: 404,
        message: "No user found with that email address",
      });
    }

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Save OTP to database (deleting any existing ones first)
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp,
    });

    // Send email with OTP
    await emailService.sendPasswordResetEmail(email, otp);

    sendSuccess(res, {
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    sendError(res, {
      message: "Error sending password reset email",
      errors: error.message,
    });
  }
};

// Verify OTP and reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return sendError(res, {
        statusCode: 400,
        message: "Please provide email, OTP, and new password",
      });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return sendError(res, {
        statusCode: 400,
        message: "Invalid or expired OTP",
      });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, {
        statusCode: 404,
        message: "User not found",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    sendSuccess(res, {
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    sendError(res, {
      message: "Error resetting password",
      errors: error.message,
    });
  }
};

// Verify OTP only
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendError(res, {
        statusCode: 400,
        message: "Please provide email and OTP",
      });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return sendError(res, {
        statusCode: 400,
        message: "Invalid or expired OTP",
      });
    }

    sendSuccess(res, {
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    sendError(res, {
      message: "Error verifying OTP",
      errors: error.message,
    });
  }
};

// Change password for logged in user
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return sendError(res, {
        statusCode: 400,
        message:
          "Please provide current password, new password, and confirm password",
      });
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return sendError(res, {
        statusCode: 400,
        message: "New password and confirm password do not match",
      });
    }

    // Validate new password strength (optional - you can customize these rules)
    if (newPassword.length < 6) {
      return sendError(res, {
        statusCode: 400,
        message: "New password must be at least 6 characters long",
      });
    }

    // Check if new password is different from current password
    if (currentPassword === newPassword) {
      return sendError(res, {
        statusCode: 400,
        message: "New password must be different from current password",
      });
    }

    // Get the current user with password field
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, {
        statusCode: 404,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return sendError(res, {
        statusCode: 400,
        message: "Current password is incorrect",
      });
    }

    // Update password (the pre-save hook will hash it automatically)
    user.password = newPassword;
    await user.save();

    sendSuccess(res, {
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    sendError(res, {
      message: "Error changing password",
      errors: error.message,
    });
  }
};
