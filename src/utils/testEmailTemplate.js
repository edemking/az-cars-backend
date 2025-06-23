const emailService = require('./emailService');
const config = require('../config/config');

// Test the email template functionality
const testEmailTemplate = async () => {
  console.log('🧪 Testing Email Template Integration...\n');

  try {
    // Test 1: Password Reset Email (with code)
    console.log('1. Testing Password Reset Email (OTP Code)...');
    const testEmail = config.EMAIL_USER || 'test@example.com';
    
    await emailService.sendPasswordResetEmail(testEmail, '1234');
    console.log('✅ Password reset email sent successfully\n');

    // Test 2: Welcome Email (with button)
    console.log('2. Testing Welcome Email (with button)...');
    await emailService.sendWelcomeEmail(testEmail, 'tempPassword123', 'John');
    console.log('✅ Welcome email sent successfully\n');

    // Test 3: Account Activation Email (with code)
    console.log('3. Testing Account Activation Email (OTP Code)...');
    await emailService.sendActivationEmail(testEmail, 'ABC123', 'Jane');
    console.log('✅ Activation email sent successfully\n');

    // Test 4: Bid Notification Email (with button)
    console.log('4. Testing Bid Notification Email (with button)...');
    await emailService.sendBidNotificationEmail(testEmail, '2023 BMW X5', 45000, 'Mike Johnson');
    console.log('✅ Bid notification email sent successfully\n');

    // Test 5: Auction End Email (with button)
    console.log('5. Testing Auction End Email (with button)...');
    await emailService.sendAuctionEndEmail(testEmail, '2023 BMW X5', 50000, 'Sarah Wilson');
    console.log('✅ Auction end email sent successfully\n');

    console.log('🎉 All email template tests completed successfully!');
    console.log('📧 Check your email inbox to verify the professional template and logo are displayed correctly.');
    
  } catch (error) {
    console.error('❌ Error testing email template:', error.message);
    
    if (error.message.includes('ENOENT')) {
      console.log('\n💡 Make sure the email template file exists at: assets/emailTemplates/05-code-activation.html');
      console.log('💡 Make sure the logo file exists at: assets/icon.png');
    }
    
    if (error.message.includes('auth')) {
      console.log('\n💡 Make sure your email credentials are configured in your environment variables:');
      console.log('   - EMAIL_SERVICE (e.g., gmail)');
      console.log('   - EMAIL_USER (your email address)');
      console.log('   - EMAIL_PASSWORD (your app password)');
    }
  }
};

// Run the test if this file is executed directly
if (require.main === module) {
  testEmailTemplate();
}

module.exports = testEmailTemplate; 