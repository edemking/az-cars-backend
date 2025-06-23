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
 * Read and prepare the email template
 * @param {string} title - Email title/subject
 * @param {string} heading - Main heading text
 * @param {string} content - Main content text
 * @param {string} codeOrButton - Either an OTP code or button text
 * @param {string} buttonLink - Link for the button (optional)
 * @param {boolean} isCode - Whether to show code section instead of button
 * @returns {string} - Complete HTML email template
 */
const getEmailTemplate = (title, heading, content, codeOrButton = '', buttonLink = '', isCode = false) => {
  try {
    // Read the template file
    const templatePath = path.join(__dirname, '../../assets/emailTemplates/05-code-activation.html');
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace template placeholders
    template = template.replace('<title></title>', `<title>${title}</title>`);
    
    // Replace logo source to use the actual logo file
    template = template.replace('src="images/logo.png"', `src="cid:logo"`);
    
    // Replace main heading
    template = template.replace(
      'Activate your Account with Code',
      heading
    );
    
    // Replace main content
    template = template.replace(
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi accus antium iste natus.',
      content
    );
    
    if (isCode) {
      // Replace the code section
      template = template.replace(
        'User Code: <span style="color:#FFFFFF;">Black#798436#</span>',
        `User Code: <span style="color:#FFFFFF;">${codeOrButton}</span>`
      );
      
      // Hide the button by removing it
      template = template.replace(
        /<tr data-element="black-intro-5-button"[\s\S]*?<\/tr>/,
        ''
      );
    } else {
      // Replace button text and link
      template = template.replace('ACTIVATE CODE', codeOrButton);
      template = template.replace('href="#"', `href="${buttonLink}"`);
      
      // Hide the code section by removing it
      template = template.replace(
        /<tr data-element="black-intro-usercode"[\s\S]*?<\/tr>/g,
        ''
      );
    }
    
    // Update footer information
    template = template.replace(
      '2022 black Inc. All Rights Reserved.<br>\n                Address name St. 152, City Name, State, Country Name',
      `${new Date().getFullYear()} AZ Cars. All Rights Reserved.<br>\n                Professional Car Auction Services`
    );
    
    // Remove social media icons (replace with empty space)
    template = template.replace(
      /<tr data-element="black-footer-social-icons"[\s\S]*?<\/tr>/g,
      ''
    );
    
    // Remove app store buttons
    template = template.replace(
      /<tr data-element="black-footer-buttons"[\s\S]*?<\/tr>/g,
      ''
    );
    
    return template;
  } catch (error) {
    console.error('Error reading email template:', error);
    // Fallback to simple HTML if template reading fails
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 40px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <img src="cid:logo" alt="AZ Cars" style="width: 189px;">
        </div>
        <h1 style="color: #fff; text-align: center; font-size: 24px;">${heading}</h1>
        <p style="color: #fff; text-align: center; font-size: 16px; line-height: 1.5;">${content}</p>
        ${isCode ? 
          `<div style="background-color: #333; padding: 20px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0; border: 3px dotted #FF0076;">
            ${codeOrButton}
          </div>` :
          `<div style="text-align: center; margin: 30px 0;">
            <a href="${buttonLink}" style="background-color: #FF0076; color: #fff; padding: 16px 38px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              ${codeOrButton}
            </a>
          </div>`
        }
        <p style="color: #999; text-align: center; font-size: 14px; margin-top: 40px;">
          © ${new Date().getFullYear()} AZ Cars. All Rights Reserved.
        </p>
      </div>
    `;
  }
};

/**
 * Send an email with the provided details using the professional template
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
 * Send a password reset OTP email using the professional template
 * @param {string} to - Recipient email
 * @param {string} otp - One-time password for verification
 * @returns {Promise} - Resolves with info about the sent email
 */
exports.sendPasswordResetEmail = async (to, otp) => {
  const subject = 'Password Reset Request - AZ Cars';
  const heading = 'Reset Your Password';
  const content = 'You\'ve requested to reset your password. Please use the verification code below to proceed. This code will expire in 1 hour.';
  
  return exports.sendEmail(to, subject, heading, content, otp, '', true);
};

/**
 * Send a welcome email to a new user using the professional template
 * @param {string} to - Recipient email
 * @param {string} password - User's initial password
 * @param {string} firstName - User's first name
 * @returns {Promise} - Resolves with info about the sent email
 */
exports.sendWelcomeEmail = async (to, password, firstName) => {
  const subject = 'Welcome to AZ Cars!';
  const heading = `Welcome ${firstName}!`;
  const content = `Thank you for joining AZ Cars. Your account has been created successfully. Your login email is ${to} and your temporary password is: ${password}. Please login and change your password for security.`;
  
  return exports.sendEmail(to, subject, heading, content, 'LOGIN NOW', config.FRONTEND_URL || '#', false);
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
  const heading = 'Activate Your Account';
  const content = `Hello ${firstName}! Welcome to AZ Cars. Please use the activation code below to verify your account and complete your registration.`;
  
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
  const subject = 'New Bid on Your Car - AZ Cars';
  const heading = 'New Bid Received!';
  const content = `Great news! ${bidderName} has placed a bid of $${bidAmount.toLocaleString()} on your ${carTitle}. Check your dashboard for more details.`;
  
  return exports.sendEmail(to, subject, heading, content, 'VIEW AUCTION', config.FRONTEND_URL || '#', false);
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
  const heading = 'Auction Has Ended';
  const content = `The auction for ${carTitle} has ended. The winning bid was $${finalBid.toLocaleString()} by ${winnerName}. Thank you for participating!`;
  
  return exports.sendEmail(to, subject, heading, content, 'VIEW RESULTS', config.FRONTEND_URL || '#', false);
}; 