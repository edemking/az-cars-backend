const emailService = require('./emailService');
const config = require('../config/config');

// Test the email template functionality
const testEmailTemplate = async () => {
  console.log('🎨 Testing Modern Email Template Design...\n');

  try {
    // Use actual email or fallback for testing
    const testEmail = config.EMAIL_USER || 'test@example.com';
    
    console.log(`📧 Sending test emails to: ${testEmail}\n`);

    // Test 1: Password Reset Email (with code)
    console.log('1. 🔐 Testing Password Reset Email (Modern OTP Design)...');
    await emailService.sendPasswordResetEmail(testEmail, '4729');
    console.log('   ✅ Password reset email sent with modern code design\n');

    // Small delay between emails
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Welcome Email (with button)
    console.log('2. 👋 Testing Welcome Email (Modern Button Design)...');
    await emailService.sendWelcomeEmail(testEmail, 'SecurePass123!', 'Alexandra');
    console.log('   ✅ Welcome email sent with modern button design\n');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Account Activation Email (with code)
    console.log('3. ✨ Testing Account Activation Email (Clean Code Style)...');
    await emailService.sendActivationEmail(testEmail, 'VERIFY2024', 'Marcus');
    console.log('   ✅ Activation email sent with clean verification code\n');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 4: Bid Notification Email (with button)
    console.log('4. 🚗 Testing Bid Notification Email (Professional Style)...');
    await emailService.sendBidNotificationEmail(testEmail, '2024 Tesla Model S Plaid', 89500, 'David Thompson');
    console.log('   ✅ Bid notification email sent with professional styling\n');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 5: Auction End Email (with button)
    console.log('5. 🏁 Testing Auction End Email (Success Theme)...');
    await emailService.sendAuctionEndEmail(testEmail, '2023 Porsche 911 Turbo', 165000, 'Jennifer Martinez');
    console.log('   ✅ Auction end email sent with success theme\n');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 6: Winner Notification Email (with button) - New!
    console.log('6. 🎉 Testing Winner Notification Email (Celebration Style)...');
    await emailService.sendWinnerNotificationEmail(testEmail, '2024 BMW M4 Competition', 75000);
    console.log('   ✅ Winner notification email sent with celebration style\n');

    console.log('🎊 All modern email template tests completed successfully!\n');
    
    console.log('📱 Key Design Improvements:');
    console.log('   • Modern gradient backgrounds and shadows');
    console.log('   • Responsive mobile-first design');
    console.log('   • Clean typography with proper hierarchy');
    console.log('   • Professional code display with security notes');
    console.log('   • Elegant buttons with hover effects');
    console.log('   • Streamlined footer without clutter');
    console.log('   • Consistent AZ Cars branding\n');
    
    console.log('📧 Check your email inbox to see the beautiful new designs!');
    console.log('💡 Each email type now has its unique style while maintaining brand consistency.');
    
  } catch (error) {
    console.error('❌ Error testing modern email template:', error.message);
    
    if (error.message.includes('ENOENT')) {
      console.log('\n💭 Note: The new design doesn\'t require external template files.');
      console.log('   Make sure the logo file exists at: assets/icon.png');
    }
    
    if (error.message.includes('auth') || error.message.includes('Invalid login')) {
      console.log('\n🔑 Email Configuration Required:');
      console.log('   Set these environment variables:');
      console.log('   • EMAIL_SERVICE (e.g., "gmail")');
      console.log('   • EMAIL_USER (your email address)');
      console.log('   • EMAIL_PASSWORD (your app-specific password)');
      console.log('\n   For Gmail, create an app password:');
      console.log('   1. Enable 2-factor authentication');
      console.log('   2. Go to Google Account > Security > App passwords');
      console.log('   3. Generate an app password for "Mail"');
    }
    
    if (error.message.includes('connect') || error.message.includes('timeout')) {
      console.log('\n🌐 Network Issue:');
      console.log('   • Check your internet connection');
      console.log('   • Verify email service settings');
      console.log('   • Try again in a few moments');
    }
    
    console.log('\n🔧 For debugging, check:');
    console.log('   • Your email service configuration');
    console.log('   • Network connectivity');
    console.log('   • Logo file path: assets/icon.png');
  }
};

// Additional utility function for development
const testSingleEmail = async (type = 'welcome', recipient = null) => {
  console.log(`🧪 Testing single email type: ${type}\n`);
  
  const testEmail = recipient || config.EMAIL_USER || 'test@example.com';
  
  try {
    switch (type.toLowerCase()) {
      case 'password':
      case 'reset':
        await emailService.sendPasswordResetEmail(testEmail, '8264');
        console.log('✅ Password reset email sent');
        break;
        
      case 'welcome':
        await emailService.sendWelcomeEmail(testEmail, 'TempPass2024!', 'Test User');
        console.log('✅ Welcome email sent');
        break;
        
      case 'activation':
      case 'verify':
        await emailService.sendActivationEmail(testEmail, 'ACTIVATE123', 'Test User');
        console.log('✅ Activation email sent');
        break;
        
      case 'bid':
        await emailService.sendBidNotificationEmail(testEmail, '2024 Audi RS6 Avant', 95000, 'John Doe');
        console.log('✅ Bid notification email sent');
        break;
        
      case 'auction':
      case 'end':
        await emailService.sendAuctionEndEmail(testEmail, '2023 McLaren 720S', 285000, 'Jane Smith');
        console.log('✅ Auction end email sent');
        break;
        
      case 'winner':
        await emailService.sendWinnerNotificationEmail(testEmail, '2024 Lamborghini Huracan', 240000);
        console.log('✅ Winner notification email sent');
        break;
        
      default:
        console.log('❌ Unknown email type. Available types:');
        console.log('   • password/reset');
        console.log('   • welcome');
        console.log('   • activation/verify');
        console.log('   • bid');
        console.log('   • auction/end');
        console.log('   • winner');
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
  }
};

// Run the test if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Single email test mode
    const emailType = args[0];
    const recipient = args[1];
    testSingleEmail(emailType, recipient);
  } else {
    // Full test suite
    testEmailTemplate();
  }
}

module.exports = { testEmailTemplate, testSingleEmail }; 