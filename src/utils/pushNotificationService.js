const { Expo } = require('expo-server-sdk');
const User = require('../models/User');

// Create a new Expo SDK client
const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

/**
 * Send push notification to a single user
 * @param {string} userId - The user ID to send notification to
 * @param {Object} notificationData - The notification data
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.body - Notification body
 * @param {Object} notificationData.data - Additional data to send with notification
 * @param {string} notificationData.sound - Sound to play (default: 'default')
 * @param {string} notificationData.image - Image URL for rich notifications
 * @returns {Promise<Object>} Result of the push notification
 */
const sendPushNotificationToUser = async (userId, notificationData) => {
  try {
    // Get user's notification token
    const user = await User.findById(userId).select('notificationToken');
    
    if (!user || !user.notificationToken) {
      console.log(`No notification token found for user ${userId}`);
      return { success: false, reason: 'No notification token' };
    }

    const pushToken = user.notificationToken;

    // Check that the push token appears to be valid
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return { success: false, reason: 'Invalid push token' };
    }

    // Construct the message
    const message = {
      to: pushToken,
      sound: notificationData.sound || 'default',
      title: notificationData.title,
      body: notificationData.body,
      data: notificationData.data || {},
    };

    // Add image if provided
    if (notificationData.image) {
      message.richContent = {
        image: notificationData.image
      };
    }

    // Send the notification
    const tickets = await expo.sendPushNotificationsAsync([message]);
    const ticket = tickets[0];

    if (ticket.status === 'error') {
      console.error(`Error sending push notification to user ${userId}:`, ticket.message);
      return { success: false, reason: ticket.message, details: ticket.details };
    }

    console.log(`Push notification sent successfully to user ${userId}`);
    return { success: true, ticket };

  } catch (error) {
    console.error(`Error sending push notification to user ${userId}:`, error);
    return { success: false, reason: error.message };
  }
};

/**
 * Send push notifications to multiple users
 * @param {Array<string>} userIds - Array of user IDs to send notifications to
 * @param {Object} notificationData - The notification data
 * @returns {Promise<Array>} Array of results for each user
 */
const sendPushNotificationsToUsers = async (userIds, notificationData) => {
  try {
    // Get all users' notification tokens
    const users = await User.find({ 
      _id: { $in: userIds },
      notificationToken: { $exists: true, $ne: null }
    }).select('_id notificationToken');

    if (users.length === 0) {
      console.log('No users with notification tokens found');
      return [];
    }

    const messages = [];
    const userTokenMap = {};

    // Prepare messages for each user
    for (const user of users) {
      const pushToken = user.notificationToken;

      // Check that the push token appears to be valid
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token for user ${user._id}`);
        continue;
      }

      userTokenMap[pushToken] = user._id;

      // Construct the message
      const message = {
        to: pushToken,
        sound: notificationData.sound || 'default',
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
      };

      // Add image if provided
      if (notificationData.image) {
        message.richContent = {
          image: notificationData.image
        };
      }

      messages.push(message);
    }

    if (messages.length === 0) {
      console.log('No valid push tokens found');
      return [];
    }

    // Chunk the messages and send them
    const chunks = expo.chunkPushNotifications(messages);
    const results = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        
        // Map tickets back to users
        ticketChunk.forEach((ticket, index) => {
          const message = chunk[index];
          const userId = userTokenMap[message.to];
          
          if (ticket.status === 'error') {
            console.error(`Error sending push notification to user ${userId}:`, ticket.message);
            results.push({ 
              userId, 
              success: false, 
              reason: ticket.message, 
              details: ticket.details 
            });
          } else {
            console.log(`Push notification sent successfully to user ${userId}`);
            results.push({ 
              userId, 
              success: true, 
              ticket 
            });
          }
        });

      } catch (error) {
        console.error('Error sending push notification chunk:', error);
        // Add failed results for this chunk
        chunk.forEach(message => {
          const userId = userTokenMap[message.to];
          results.push({ 
            userId, 
            success: false, 
            reason: error.message 
          });
        });
      }
    }

    return results;

  } catch (error) {
    console.error('Error sending push notifications to users:', error);
    throw error;
  }
};

/**
 * Send push notification to all bidders in an auction except the new bidder
 * @param {string} auctionId - The auction ID
 * @param {string} newBidderId - The ID of the user who just placed the bid
 * @param {Object} notificationData - The notification data
 * @returns {Promise<Array>} Array of results for each user
 */
const sendPushNotificationToAuctionBidders = async (auctionId, newBidderId, notificationData) => {
  try {
    const Bid = require('../models/Bid');
    
    // Find all users who have bid on this auction (except the new bidder)
    const previousBids = await Bid.find({
      auction: auctionId,
      bidder: { $ne: newBidderId }
    }).populate('bidder', '_id');

    // Get unique bidder IDs
    const uniqueBidderIds = [...new Set(previousBids.map(bid => bid.bidder._id.toString()))];

    if (uniqueBidderIds.length === 0) {
      console.log(`No other bidders found for auction ${auctionId}`);
      return [];
    }

    console.log(`Sending push notifications to ${uniqueBidderIds.length} bidders for auction ${auctionId}`);
    
    // Send push notifications to all bidders
    return await sendPushNotificationsToUsers(uniqueBidderIds, notificationData);

  } catch (error) {
    console.error('Error sending push notifications to auction bidders:', error);
    throw error;
  }
};

/**
 * Send push notifications to users about a new auction
 * @param {Object} auction - The auction object
 * @param {Object} populatedAuction - The auction with populated car details
 * @param {string} carDetails - The car details string
 * @param {Array} usersWithTokens - Array of users with notification tokens
 * @returns {Promise<Array>} Array of results for each user
 */
const sendPushNotificationToUsersForNewAuction = async (auction, populatedAuction, carDetails, usersWithTokens) => {
  try {
    if (usersWithTokens.length === 0) {
      console.log('No users with notification tokens found for new auction push notification');
      return [];
    }

    console.log(`Sending push notifications about new auction to ${usersWithTokens.length} users`);

    // Calculate auction end time for better description
    const endTime = new Date(auction.endTime);
    const now = new Date();
    const durationHours = Math.ceil((endTime - now) / (1000 * 60 * 60));

    // Prepare notification data
    const notificationData = {
      title: 'New Auction Available! 🚗',
      body: `${carDetails} auction just started! Starting bid: AED ${auction.startingPrice.toLocaleString()}. Auction ends in ${durationHours}h.`,
      sound: 'default',
      data: {
        type: 'new_auction_created',
        auctionId: auction._id.toString(),
        auctionTitle: auction.auctionTitle,
        carDetails: carDetails,
        startingPrice: auction.startingPrice,
        endTime: auction.endTime.toISOString(),
        auctionType: auction.type
      }
    };

    // Extract user IDs from users with tokens
    const userIds = usersWithTokens.map(user => user._id.toString());

    // Send push notifications to all users
    const results = await sendPushNotificationsToUsers(userIds, notificationData);

    console.log(`Push notifications sent for new auction. Success: ${results.filter(r => r.success).length}, Failed: ${results.filter(r => !r.success).length}`);

    return results;

  } catch (error) {
    console.error('Error sending push notifications for new auction:', error);
    throw error;
  }
};

module.exports = {
  sendPushNotificationToUser,
  sendPushNotificationsToUsers,
  sendPushNotificationToAuctionBidders,
  sendPushNotificationToUsersForNewAuction
}; 