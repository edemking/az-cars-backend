const mongoose = require('mongoose');
const {
  createBidPlacedNotification,
  createOutbidNotifications,
  createAuctionWonNotification,
  createAuctionLostNotifications,
  createNewBidOnAuctionNotification
} = require('./notificationService');

// Mock data for testing
const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  firstName: 'John',
  lastName: 'Doe'
};

const mockAuction = {
  _id: new mongoose.Types.ObjectId(),
  auctionTitle: 'Test 2020 Toyota Camry Auction',
  createdBy: new mongoose.Types.ObjectId(),
  currentHighestBid: 15000,
  car: {
    make: { name: 'Toyota' },
    model: { name: 'Camry' }
  }
};

const mockBid = {
  _id: new mongoose.Types.ObjectId(),
  bidder: mockUser._id,
  amount: 16000,
  auction: mockAuction._id
};

/**
 * Test notification creation functions
 */
const testNotifications = async () => {
  try {
    console.log('Testing notification system...');

    // Test bid placed notification
    console.log('1. Testing bid placed notification...');
    await createBidPlacedNotification(mockBid, mockAuction);
    console.log('✓ Bid placed notification created');

    // Test outbid notifications
    console.log('2. Testing outbid notifications...');
    await createOutbidNotifications(mockBid, mockAuction);
    console.log('✓ Outbid notifications created');

    // Test new bid on auction notification
    console.log('3. Testing new bid on auction notification...');
    await createNewBidOnAuctionNotification(mockBid, mockAuction);
    console.log('✓ New bid on auction notification created');

    // Test auction won notification
    console.log('4. Testing auction won notification...');
    const completedAuction = { ...mockAuction, winner: mockUser._id, status: 'completed' };
    await createAuctionWonNotification(completedAuction, mockBid);
    console.log('✓ Auction won notification created');

    // Test auction lost notifications
    console.log('5. Testing auction lost notifications...');
    await createAuctionLostNotifications(completedAuction, mockBid);
    console.log('✓ Auction lost notifications created');

    console.log('\n✅ All notification tests completed successfully!');
  } catch (error) {
    console.error('❌ Notification test failed:', error);
  }
};

module.exports = { testNotifications };

// Run tests if this file is executed directly
if (require.main === module) {
  // Connect to database first
  require('../config/db')();
  
  setTimeout(() => {
    testNotifications().then(() => {
      console.log('Test completed');
      process.exit(0);
    }).catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
  }, 2000); // Wait for DB connection
} 