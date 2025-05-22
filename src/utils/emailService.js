const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: config.EMAIL_SERVICE, // e.g., 'gmail'
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD,
  },
});

/**
 * Send an email with the provided details
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body in HTML format
 * @returns {Promise} - Resolves with info about the sent email
 */
exports.sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"AZ Cars" <${config.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send a password reset OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - One-time password for verification
 * @returns {Promise} - Resolves with info about the sent email
 */
exports.sendPasswordResetEmail = async (to, otp) => {
  const subject = 'Password Reset Request - AZ Cars';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">AZ Cars Password Reset</h2>
      <p>You've requested to reset your password. Please use the following verification code to proceed:</p>
      <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in 1 hour.</p>
      <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
      <p>Thank you,<br>AZ Cars Team</p>
    </div>
  `;

  return exports.sendEmail(to, subject, html);
};

/**
 * Send a welcome email to a new user
 * @param {string} to - Recipient email
 * @param {string} password - User's initial password
 * @param {string} firstName - User's first name
 * @returns {Promise} - Resolves with info about the sent email
 */
exports.sendWelcomeEmail = async (to, password, firstName) => {
  const subject = 'Welcome to AZ Cars!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to AZ Cars!</h2>
      <p>Hello ${firstName},</p>
      <p>Thank you for joining AZ Cars. Your account has been created successfully.</p>
      <p>Here are your login credentials:</p>
      <ul>
        <li><strong>Email:</strong> ${to}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Please keep this information secure and consider changing your password after your first login.</p>
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      <p>Thank you,<br>AZ Cars Team</p>
    </div>
  `;

  return exports.sendEmail(to, subject, html);
}; 