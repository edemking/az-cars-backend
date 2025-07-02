const nodemailer = require('nodemailer');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: config.EMAIL_SERVICE, // e.g., 'gmail'
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD,
  },
});

/**
 * Create a modern, clean email template
 * @param {string} title - Email title/subject
 * @param {string} heading - Main heading text
 * @param {string} content - Main content text
 * @param {string} codeOrButton - Either an OTP code or button text
 * @param {string} buttonLink - Link for the button (optional)
 * @param {boolean} isCode - Whether to show code section instead of button
 * @returns {string} - Complete HTML email template
 */
const getEmailTemplate = (title, heading, content, codeOrButton = '', buttonLink = '', isCode = false) => {
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #ffffff;
          background-color: #000000;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .header {
          background: linear-gradient(135deg, #000000 0%, #2a2a2a 100%);
          padding: 40px 20px;
          text-align: center;
          border-bottom: 3px solid #FF0076;
        }
        
        .logo {
          width: 120px;
          height: auto;
          margin-bottom: 20px;
          filter: drop-shadow(0 4px 8px rgba(255, 255, 255, 0.1));
        }
        
        .content {
          padding: 50px 40px;
          text-align: center;
        }
        
        .heading {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 20px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .message {
          font-size: 16px;
          color: #cccccc;
          line-height: 1.8;
          margin-bottom: 40px;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .code-section {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border: 2px dashed #FF0076;
          border-radius: 12px;
          padding: 30px;
          margin: 30px 0;
          text-align: center;
        }
        
        .code-label {
          font-size: 14px;
          color: #999999;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .code-value {
          font-size: 28px;
          font-weight: 700;
          color: #FF0076;
          font-family: 'Courier New', monospace;
          letter-spacing: 3px;
          text-shadow: 0 2px 4px rgba(255, 0, 118, 0.3);
        }
        
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #FF0076 0%, #FF3399 100%);
          color: #ffffff;
          padding: 16px 40px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 0, 118, 0.3);
          border: none;
          cursor: pointer;
        }
        
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 0, 118, 0.4);
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #333333, transparent);
          margin: 40px 0;
        }
        
        .footer {
          background: #0a0a0a;
          padding: 30px 40px;
          text-align: center;
          border-top: 1px solid #333333;
        }
        
        .footer-text {
          font-size: 14px;
          color: #666666;
          margin-bottom: 15px;
        }
        
        .footer-links {
          margin-top: 20px;
        }
        
        .footer-links a {
          color: #888888;
          text-decoration: none;
          font-size: 12px;
          margin: 0 10px;
          transition: color 0.3s ease;
        }
        
        .footer-links a:hover {
          color: #FF0076;
        }
        
        .security-note {
          background: rgba(255, 0, 118, 0.1);
          border: 1px solid rgba(255, 0, 118, 0.3);
          border-radius: 8px;
          padding: 15px;
          margin-top: 30px;
          font-size: 13px;
          color: #cccccc;
        }
        
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          .heading {
            font-size: 24px;
          }
          
          .message {
            font-size: 14px;
          }
          
          .code-value {
            font-size: 24px;
          }
          
          .button {
            padding: 14px 30px;
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="cid:logo" alt="AZ Cars" class="logo">
        </div>
        
        <div class="content">
          <h1 class="heading">${heading}</h1>
          <p class="message">${content}</p>
          
          ${isCode ? `
            <div class="code-section">
              <div class="code-label">Verification Code</div>
              <div class="code-value">${codeOrButton}</div>
            </div>
            <div class="security-note">
              <strong>Security Note:</strong> This code will expire in 1 hour. Never share this code with anyone.
            </div>
          ` : `
            <a href="${buttonLink}" class="button">${codeOrButton}</a>
          `}
        </div>
        
        <div class="divider"></div>
        
        <div class="footer">
          <div class="footer-text">
            <strong>AZ Cars</strong><br>
            Professional Car Auction Services
          </div>
          <div class="footer-text">
            © ${currentYear} AZ Cars. All Rights Reserved.
          </div>
          <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Support</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Create a welcome email template with custom credentials section
 * @param {string} title - Email title/subject
 * @param {string} heading - Main heading text
 * @param {string} content - Main content text
 * @param {string} credentialsHtml - Custom HTML for credentials display
 * @returns {string} - Complete HTML email template
 */
const getWelcomeEmailTemplate = (title, heading, content, credentialsHtml) => {
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #ffffff;
          background-color: #000000;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .header {
          background: linear-gradient(135deg, #000000 0%, #2a2a2a 100%);
          padding: 40px 20px;
          text-align: center;
          border-bottom: 3px solid #FF0076;
        }
        
        .logo {
          width: 120px;
          height: auto;
          margin-bottom: 20px;
          filter: drop-shadow(0 4px 8px rgba(255, 255, 255, 0.1));
        }
        
        .content {
          padding: 50px 40px;
          text-align: center;
        }
        
        .heading {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 20px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .message {
          font-size: 16px;
          color: #cccccc;
          line-height: 1.8;
          margin-bottom: 20px;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #FF0076 0%, #FF3399 100%);
          color: #ffffff;
          padding: 16px 40px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 0, 118, 0.3);
          border: none;
          cursor: pointer;
          margin-top: 20px;
        }
        
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 0, 118, 0.4);
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #333333, transparent);
          margin: 40px 0;
        }
        
        .footer {
          background: #0a0a0a;
          padding: 30px 40px;
          text-align: center;
          border-top: 1px solid #333333;
        }
        
        .footer-text {
          font-size: 14px;
          color: #666666;
          margin-bottom: 15px;
        }
        
        .footer-links {
          margin-top: 20px;
        }
        
        .footer-links a {
          color: #888888;
          text-decoration: none;
          font-size: 12px;
          margin: 0 10px;
          transition: color 0.3s ease;
        }
        
        .footer-links a:hover {
          color: #FF0076;
        }
        
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          .heading {
            font-size: 24px;
          }
          
          .message {
            font-size: 14px;
          }
          
          .button {
            padding: 14px 30px;
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="cid:logo" alt="AZ Cars" class="logo">
        </div>
        
        <div class="content">
          <h1 class="heading">${heading}</h1>
          <p class="message">${content}</p>
          
          ${credentialsHtml}
          
          <a href="${config.FRONTEND_URL || 'https://azcars.com'}" class="button">LOGIN NOW</a>
        </div>
        
        <div class="divider"></div>
        
        <div class="footer">
          <div class="footer-text">
            <strong>AZ Cars</strong><br>
            Professional Car Auction Services
          </div>
          <div class="footer-text">
            © ${currentYear} AZ Cars. All Rights Reserved.
          </div>
          <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Support</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send an email with the provided details using the modern template
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} heading - Main heading text
 * @param {string} content - Main content text
 * @param {string} codeOrButton - Either an OTP code or button text
 * @param {string} buttonLink - Link for the button (optional)
 * @param {boolean} isCode - Whether to show code section instead of button
 * @returns {Promise} - Resolves with info about the sent email
 */
exports.sendEmail = async (to, subject, heading, content, codeOrButton = '', buttonLink = '', isCode = false) => {
  const html = getEmailTemplate(subject, heading, content, codeOrButton, buttonLink, isCode);
  
  const logoPath = path.join(__dirname, '../../assets/icon.png');
  
  const mailOptions = {
    from: `"AZ Cars" <${config.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments: [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo' // Referenced in the HTML template
      }
    ]
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send a password reset OTP email using the modern template
 * @param {string} to - Recipient email
 * @param {string} otp - One-time password for verification
 * @returns {Promise} - Resolves with info about the sent email
 */
exports.sendPasswordResetEmail = async (to, otp) => {
  const subject = 'Password Reset Request - AZ Cars';
  const heading = 'Reset Your Password';
  const content = 'You requested to reset your password. Please use the verification code below to proceed. If you didn\'t request this, please ignore this email.';
  
  return exports.sendEmail(to, subject, heading, content, otp, '', true);
};

/**
 * Send a welcome email to a new user with distinct credentials display
 * @param {string} to - Recipient email
 * @param {string} password - User's initial password
 * @param {string} firstName - User's first name
 * @returns {Promise} - Resolves with info about the sent email
 */
exports.sendWelcomeEmail = async (to, password, firstName) => {
  const subject = 'Welcome to AZ Cars!';
  const heading = `Welcome ${firstName}!`;
  const content = `Thank you for joining AZ Cars! Your account has been created successfully. Please use the credentials below to access your account:`;
  
  // Create custom HTML with distinct credential display
  const credentialsHtml = `
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); border: 2px solid #FF0076; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: left;">
      <div style="margin-bottom: 20px;">
        <div style="font-size: 14px; color: #999999; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Email Address</div>
        <div style="font-size: 18px; font-weight: 700; color: #ffffff; font-family: 'Courier New', monospace; background: rgba(255, 0, 118, 0.1); padding: 10px; border-radius: 6px; word-break: break-all;">${to}</div>
      </div>
      <div>
        <div style="font-size: 14px; color: #999999; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Temporary Password</div>
        <div style="font-size: 18px; font-weight: 700; color: #FF0076; font-family: 'Courier New', monospace; background: rgba(255, 0, 118, 0.1); padding: 10px; border-radius: 6px; letter-spacing: 2px;">${password}</div>
      </div>
    </div>
    <div style="background: rgba(255, 0, 118, 0.1); border: 1px solid rgba(255, 0, 118, 0.3); border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 13px; color: #cccccc;">
      <strong>Important:</strong> This is a temporary password. Please login and change it immediately for security reasons.
    </div>
  `;
  
  // Modify the email template to include credentials
  const html = getWelcomeEmailTemplate(subject, heading, content, credentialsHtml);
  
  const logoPath = path.join(__dirname, '../../assets/icon.png');
  
  const mailOptions = {
    from: `"AZ Cars" <${config.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments: [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo'
      }
    ]
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send account activation email
 * @param {string} to - Recipient email
 * @param {string} activationCode - Activation code
 * @param {string} firstName - User's first name
 * @returns {Promise} - Resolves with info about the sent email
 */
exports.sendActivationEmail = async (to, activationCode, firstName) => {
  const subject = 'Activate Your AZ Cars Account';
  const heading = `Welcome ${firstName}!`;
  const content = 'Welcome to AZ Cars! Please use the activation code below to verify your account and complete your registration.';
  
  return exports.sendEmail(to, subject, heading, content, activationCode, '', true);
};

/**
 * Send bid notification email
 * @param {string} to - Recipient email
 * @param {string} carTitle - Car title
 * @param {number} bidAmount - Bid amount
 * @param {string} bidderName - Name of the bidder
 * @returns {Promise} - Resolves with info about the sent email
 */
exports.sendBidNotificationEmail = async (to, carTitle, bidAmount, bidderName) => {
  const subject = 'New Bid Received - AZ Cars';
  const heading = 'New Bid Received!';
  const content = `Exciting news! <strong>${bidderName}</strong> has placed a bid of <strong>AED ${bidAmount.toLocaleString()}</strong> on your <strong>${carTitle}</strong>. Check your dashboard to see all bids and manage your auction.`;
  
  return exports.sendEmail(to, subject, heading, content, 'VIEW AUCTION', config.FRONTEND_URL || 'https://azcars.com', false);
};

/**
 * Send auction end notification email
 * @param {string} to - Recipient email
 * @param {string} carTitle - Car title
 * @param {number} finalBid - Final bid amount
 * @param {string} winnerName - Name of the winner
 * @returns {Promise} - Resolves with info about the sent email
 */
exports.sendAuctionEndEmail = async (to, carTitle, finalBid, winnerName) => {
  const subject = 'Auction Ended - AZ Cars';
  const heading = 'Auction Complete!';
  const content = `The auction for <strong>${carTitle}</strong> has ended successfully! The winning bid was <strong>AED ${finalBid.toLocaleString()}</strong> by <strong>${winnerName}</strong>. Thank you for using AZ Cars!`;
  
  return exports.sendEmail(to, subject, heading, content, 'VIEW RESULTS', config.FRONTEND_URL || 'https://azcars.com', false);
};

/**
 * Send auction winner notification email
 * @param {string} to - Recipient email
 * @param {string} carTitle - Car title
 * @param {number} winningBid - Winning bid amount
 * @returns {Promise} - Resolves with info about the sent email
 */
exports.sendWinnerNotificationEmail = async (to, carTitle, winningBid) => {
  const subject = 'Congratulations! You Won - AZ Cars';
  const heading = 'Congratulations!';
  const content = `You've won the auction for <strong>${carTitle}</strong> with your bid of <strong>AED ${winningBid.toLocaleString()}</strong>! Please check your dashboard for next steps and payment instructions.`;
  
  return exports.sendEmail(to, subject, heading, content, 'VIEW DETAILS', config.FRONTEND_URL || 'https://azcars.com', false);
};

/**
 * Send auction loser notification email
 * @param {string} to - Recipient email
 * @param {string} carTitle - Car title
 * @param {number} winningBid - Winning bid amount
 * @returns {Promise} - Resolves with info about the sent email
 */
exports.sendAuctionLoserEmail = async (to, carTitle, winningBid) => {
  const subject = 'Auction Ended - AZ Cars';
  const heading = 'Auction Complete';
  const content = `The auction for <strong>${carTitle}</strong> has ended. Unfortunately, you were not the winning bidder. The winning bid was <strong>AED ${winningBid.toLocaleString()}</strong>. Don't worry, there are many more exciting auctions coming up!`;
  
  return exports.sendEmail(to, subject, heading, content, 'BROWSE AUCTIONS', config.FRONTEND_URL || 'https://azcars.com', false);
};

/**
 * Send new auction created notification email to all users
 * @param {string} to - Recipient email
 * @param {string} carTitle - Car title
 * @param {string} carDetails - Car make and model details
 * @param {number} startingPrice - Starting price of the auction
 * @param {Date} endTime - End time of the auction
 * @returns {Promise} - Resolves with info about the sent email
 */
exports.sendNewAuctionEmail = async (to, carTitle, carDetails, startingPrice, endTime) => {
  const subject = 'New Auction Available - AZ Cars';
  const heading = 'New Auction Live!';
  const endDate = new Date(endTime).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const content = `A new auction is now live! <strong>${carTitle}</strong> (${carDetails}) is available for bidding. Starting price: <strong>AED ${startingPrice.toLocaleString()}</strong>. Auction ends on <strong>${endDate}</strong>. Don't miss out on this opportunity!`;
  
  return exports.sendEmail(to, subject, heading, content, 'VIEW AUCTION', config.FRONTEND_URL || 'https://azcars.com', false);
};

/**
 * Send new bid alert to all bidders in an auction (without showing bidder name)
 * @param {string} to - Recipient email
 * @param {string} carTitle - Car title
 * @param {number} bidAmount - New bid amount
 * @returns {Promise} - Resolves with info about the sent email
 */
exports.sendNewBidAlertEmail = async (to, carTitle, bidAmount) => {
  const subject = 'New Bid Alert - AZ Cars';
  const heading = 'New Bid Placed!';
  const content = `A new bid has been placed on <strong>${carTitle}</strong>! The latest bid is <strong>AED ${bidAmount.toLocaleString()}</strong>. Place your bid now to stay in the game!`;
  
  return exports.sendEmail(to, subject, heading, content, 'PLACE BID', config.FRONTEND_URL || 'https://azcars.com', false);
}; 