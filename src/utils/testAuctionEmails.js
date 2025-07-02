const { 
  sendWinnerNotificationEmail, 
  sendAuctionLoserEmail, 
  sendNewAuctionEmail, 
  sendNewBidAlertEmail 
} = require('./emailService');

/**
 * Test all auction-related email functions
 */
const testAuctionEmails = async () => {
  console.log('🧪 Testing auction email notifications...');
  
  const testEmail = 'test@example.com';
  const carTitle = '2023 BMW X5 M Sport';
  const carDetails = 'BMW X5';
  const bidAmount = 150000; // AED
  const startingPrice = 120000; // AED
  const endTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  try {
    // Test 1: New Auction Email
    console.log('📧 Testing new auction email...');
    await sendNewAuctionEmail(testEmail, carTitle, carDetails, startingPrice, endTime);
    console.log('✅ New auction email sent successfully');
    
    // Test 2: New Bid Alert Email
    console.log('📧 Testing new bid alert email...');
    await sendNewBidAlertEmail(testEmail, carTitle, bidAmount);
    console.log('✅ New bid alert email sent successfully');
    
    // Test 3: Winner Notification Email
    console.log('📧 Testing winner notification email...');
    await sendWinnerNotificationEmail(testEmail, carTitle, bidAmount);
    console.log('✅ Winner notification email sent successfully');
    
    // Test 4: Auction Loser Email
    console.log('📧 Testing auction loser email...');
    await sendAuctionLoserEmail(testEmail, carTitle, bidAmount);
    console.log('✅ Auction loser email sent successfully');
    
    console.log('🎉 All auction email tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing auction emails:', error);
    throw error;
  }
};

module.exports = { testAuctionEmails };

// Run tests if this file is executed directly
if (require.main === module) {
  testAuctionEmails()
    .then(() => {
      console.log('Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
} 