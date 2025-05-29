const mongoose = require('mongoose');
const { 
  sendPushNotificationToUser, 
  sendPushNotificationsToUsers,
  sendPushNotificationToAuctionBidders 
} = require('./pushNotificationService');

/**
 * Test push notification to a single user
 * @param {string} userId - User ID to test
 */
const testSingleUserNotification = async (userId) => {
  console.log(`Testing push notification to user: ${userId}`);
  
  const result = await sendPushNotificationToUser(userId, {
    title: 'Test Notification',
    body: 'This is a test push notification from AZ Cars',
    data: {
      type: 'test',
      timestamp: new Date().toISOString()
    }
  });
  
  console.log('Result:', result);
  return result;
};

/**
 * Test push notifications to multiple users
 * @param {Array<string>} userIds - Array of user IDs to test
 */
const testMultipleUsersNotification = async (userIds) => {
  console.log(`Testing push notifications to ${userIds.length} users`);
  
  const results = await sendPushNotificationsToUsers(userIds, {
    title: 'Bulk Test Notification',
    body: 'This is a bulk test push notification from AZ Cars',
    data: {
      type: 'bulk_test',
      timestamp: new Date().toISOString()
    }
  });
  
  console.log('Results:', results);
  return results;
};

/**
 * Test auction bidders notification
 * @param {string} auctionId - Auction ID to test
 * @param {string} excludeBidderId - Bidder ID to exclude
 */
const testAuctionBiddersNotification = async (auctionId, excludeBidderId) => {
  console.log(`Testing auction bidders notification for auction: ${auctionId}`);
  
  const results = await sendPushNotificationToAuctionBidders(
    auctionId,
    excludeBidderId,
    {
      title: 'Test New Bid Alert!',
      body: 'Someone placed a test bid on the auction',
      data: {
        type: 'test_new_bid',
        auctionId: auctionId,
        timestamp: new Date().toISOString()
      }
    }
  );
  
  console.log('Results:', results);
  return results;
};

/**
 * Test with mock Expo push token format
 */
const testWithMockToken = async () => {
  console.log('Testing with mock Expo push token...');
  
  // This will test the token validation
  const mockUserId = new mongoose.Types.ObjectId();
  
  // First, you would need to manually add a test token to a user in the database
  console.log('Note: To test this properly, you need to:');
  console.log('1. Get a real Expo push token from your mobile app');
  console.log('2. Update a user\'s notificationToken field in the database');
  console.log('3. Call testSingleUserNotification with that user\'s ID');
  console.log('');
  console.log('Example Expo push token format: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]');
  console.log('');
  console.log('You can update a user\'s token using the API:');
  console.log('PUT /api/users/:id/notification-token');
  console.log('Body: { "notificationToken": "ExponentPushToken[your-token-here]" }');
};

/**
 * Run all tests
 */
const runAllTests = async () => {
  try {
    console.log('=== Push Notification Tests ===\n');
    
    await testWithMockToken();
    
    // Uncomment and modify these lines with real user IDs and auction IDs to test
    // await testSingleUserNotification('64a1b2c3d4e5f6789012345');
    // await testMultipleUsersNotification(['64a1b2c3d4e5f6789012345', '64a1b2c3d4e5f6789012346']);
    // await testAuctionBiddersNotification('64a1b2c3d4e5f6789012347', '64a1b2c3d4e5f6789012345');
    
    console.log('\n=== Tests completed ===');
  } catch (error) {
    console.error('Error running tests:', error);
  }
};

// Export functions for individual testing
module.exports = {
  testSingleUserNotification,
  testMultipleUsersNotification,
  testAuctionBiddersNotification,
  testWithMockToken,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
} 