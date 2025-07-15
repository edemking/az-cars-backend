const Notification = require('../models/Notification');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');
const { sendPushNotificationToAuctionBidders } = require('./pushNotificationService');
const { 
  sendWinnerNotificationEmail, 
  sendAuctionLoserEmail, 
  sendNewAuctionEmail, 
  sendNewBidAlertEmail 
} = require('./emailService');

/**
 * Create a notification for a user
 * @param {Object} notificationData - The notification data
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    
    // Emit real-time notification if socket.io is available
    if (global.io) {
      global.io.to(`user-${notificationData.user}`).emit('new-notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create notification when a new bid is placed
 * @param {Object} bid - The bid object
 * @param {Object} auction - The auction object
 */
const createBidPlacedNotification = async (bid, auction) => {
  try {
    // Get car details for better description
    const populatedAuction = await Auction.findById(auction._id).populate({
      path: 'car',
      populate: [
        { path: 'make', select: 'name' },
        { path: 'model', select: 'name' }
      ]
    });

    const carDetails = `${populatedAuction.car.make.name} ${populatedAuction.car.model.name}`;

    await createNotification({
      user: bid.bidder,
      type: 'bid_placed',
      title: 'Bid Placed Successfully',
      description: `Your bid of AED ${bid.amount.toLocaleString()} has been placed on ${auction.auctionTitle}`,
      auction: auction._id,
      bid: bid._id,
      metadata: {
        bidAmount: bid.amount,
        auctionTitle: auction.auctionTitle,
        carDetails: carDetails
      }
    });
  } catch (error) {
    console.error('Error creating bid placed notification:', error);
  }
};

/**
 * Create notifications when users are outbid
 * @param {Object} newBid - The new bid object
 * @param {Object} auction - The auction object
 */
const createOutbidNotifications = async (newBid, auction) => {
  try {
    // Find all users who have bid on this auction (except the new bidder)
    const previousBids = await Bid.find({
      auction: auction._id,
      bidder: { $ne: newBid.bidder }
    }).populate('bidder', 'firstName lastName email');

    // Get unique bidders
    const uniqueBidders = [...new Map(previousBids.map(bid => [bid.bidder._id.toString(), bid.bidder])).values()];

    // Get car details
    const populatedAuction = await Auction.findById(auction._id).populate({
      path: 'car',
      populate: [
        { path: 'make', select: 'name' },
        { path: 'model', select: 'name' }
      ]
    });

    const carDetails = `${populatedAuction.car.make.name} ${populatedAuction.car.model.name}`;

    // Create outbid notifications for each unique bidder
    const notificationPromises = uniqueBidders.map(bidder => 
      createNotification({
        user: bidder._id,
        type: 'outbid',
        title: 'You\'ve Been Outbid!',
        description: `Someone placed a higher bid of AED ${newBid.amount.toLocaleString()} on ${auction.auctionTitle}`,
        auction: auction._id,
        bid: newBid._id,
        metadata: {
          bidAmount: newBid.amount,
          auctionTitle: auction.auctionTitle,
          carDetails: carDetails
        }
      })
    );

    await Promise.all(notificationPromises);

    // Send email notifications to all other bidders (new bid alert without showing bidder name)
    // DISABLED: Auction activity emails disabled as requested
    /*
    const emailPromises = uniqueBidders.map(async (bidder) => {
      try {
        if (bidder.email) {
          await sendNewBidAlertEmail(
            bidder.email,
            auction.auctionTitle,
            newBid.amount
          );
          console.log(`New bid alert email sent to ${bidder.email} for auction ${auction._id}`);
        }
      } catch (emailError) {
        console.error(`Error sending new bid alert email to ${bidder.email}:`, emailError);
        // Don't fail if individual email fails
      }
    });

    await Promise.all(emailPromises);
    */

    // Send push notifications to all other bidders
    try {
      await sendPushNotificationToAuctionBidders(
        auction._id,
        newBid.bidder,
        {
          title: 'New Bid Alert!',
          body: `Someone placed a bid of AED ${newBid.amount.toLocaleString()} on ${auction.auctionTitle}`,
          data: {
            type: 'new_bid',
            auctionId: auction._id.toString(),
            bidId: newBid._id.toString(),
            bidAmount: newBid.amount,
            auctionTitle: auction.auctionTitle,
            carDetails: carDetails
          }
        }
      );
    } catch (pushError) {
      console.error('Error sending push notifications for new bid:', pushError);
      // Don't fail the notification creation if push notifications fail
    }
  } catch (error) {
    console.error('Error creating outbid notifications:', error);
  }
};

/**
 * Create notification when user wins an auction
 * @param {Object} auction - The auction object
 * @param {Object} winningBid - The winning bid object
 */
const createAuctionWonNotification = async (auction, winningBid) => {
  try {
    // Get car details and winner user info
    const populatedAuction = await Auction.findById(auction._id).populate({
      path: 'car',
      populate: [
        { path: 'make', select: 'name' },
        { path: 'model', select: 'name' }
      ]
    });

    const carDetails = `${populatedAuction.car.make.name} ${populatedAuction.car.model.name}`;

    // Create in-app notification
    await createNotification({
      user: auction.winner,
      type: 'auction_won',
      title: 'Congratulations! You Won!',
      description: `You won the auction for ${auction.auctionTitle} with a bid of AED ${winningBid.amount.toLocaleString()}`,
      auction: auction._id,
      bid: winningBid._id,
      metadata: {
        bidAmount: winningBid.amount,
        auctionTitle: auction.auctionTitle,
        carDetails: carDetails
      }
    });

    // Send email notification to winner
    // DISABLED: Auction activity emails disabled as requested
    /*
    try {
      const winner = await User.findById(auction.winner).select('email firstName lastName');
      if (winner && winner.email) {
        await sendWinnerNotificationEmail(
          winner.email,
          auction.auctionTitle,
          winningBid.amount
        );
        console.log(`Winner email sent to ${winner.email} for auction ${auction._id}`);
      }
    } catch (emailError) {
      console.error('Error sending winner email:', emailError);
      // Don't fail notification creation if email fails
    }
    */
  } catch (error) {
    console.error('Error creating auction won notification:', error);
  }
};

/**
 * Create notifications for users who lost an auction
 * @param {Object} auction - The auction object
 * @param {Object} winningBid - The winning bid object
 */
const createAuctionLostNotifications = async (auction, winningBid) => {
  try {
    // Find all users who bid on this auction but didn't win
    const losingBids = await Bid.find({
      auction: auction._id,
      bidder: { $ne: auction.winner }
    }).populate('bidder', 'firstName lastName email');

    // Get unique losing bidders
    const uniqueLosingBidders = [...new Map(losingBids.map(bid => [bid.bidder._id.toString(), bid.bidder])).values()];

    // Get car details
    const populatedAuction = await Auction.findById(auction._id).populate({
      path: 'car',
      populate: [
        { path: 'make', select: 'name' },
        { path: 'model', select: 'name' }
      ]
    });

    const carDetails = `${populatedAuction.car.make.name} ${populatedAuction.car.model.name}`;

    // Create auction lost notifications
    const notificationPromises = uniqueLosingBidders.map(bidder => 
      createNotification({
        user: bidder._id,
        type: 'auction_lost',
        title: 'Auction Ended',
        description: `The auction for ${auction.auctionTitle} has ended. The winning bid was AED ${winningBid.amount.toLocaleString()}`,
        auction: auction._id,
        bid: winningBid._id,
        metadata: {
          bidAmount: winningBid.amount,
          auctionTitle: auction.auctionTitle,
          carDetails: carDetails
        }
      })
    );

    await Promise.all(notificationPromises);

    // Send email notifications to losing bidders
    // DISABLED: Auction activity emails disabled as requested
    /*
    const emailPromises = uniqueLosingBidders.map(async (bidder) => {
      try {
        if (bidder.email) {
          await sendAuctionLoserEmail(
            bidder.email,
            auction.auctionTitle,
            winningBid.amount
          );
          console.log(`Loser email sent to ${bidder.email} for auction ${auction._id}`);
        }
      } catch (emailError) {
        console.error(`Error sending loser email to ${bidder.email}:`, emailError);
        // Don't fail if individual email fails
      }
    });

    await Promise.all(emailPromises);
    */
  } catch (error) {
    console.error('Error creating auction lost notifications:', error);
  }
};

/**
 * Create notifications for auction ending soon
 * @param {Object} auction - The auction object
 */
const createAuctionEndingSoonNotifications = async (auction) => {
  try {
    // Find all users who have bid on this auction
    const bids = await Bid.find({ auction: auction._id }).populate('bidder', 'firstName lastName');
    
    // Get unique bidders
    const uniqueBidders = [...new Map(bids.map(bid => [bid.bidder._id.toString(), bid.bidder])).values()];

    // Get car details
    const populatedAuction = await Auction.findById(auction._id).populate({
      path: 'car',
      populate: [
        { path: 'make', select: 'name' },
        { path: 'model', select: 'name' }
      ]
    });

    const carDetails = `${populatedAuction.car.make.name} ${populatedAuction.car.model.name}`;

    // Calculate time remaining
    const timeRemaining = Math.ceil((auction.endTime - new Date()) / (1000 * 60)); // minutes

    // Create ending soon notifications
    const notificationPromises = uniqueBidders.map(bidder => 
      createNotification({
        user: bidder._id,
        type: 'auction_ending_soon',
        title: 'Auction Ending Soon!',
        description: `The auction for ${auction.auctionTitle} ends in ${timeRemaining} minutes. Current highest bid: AED ${auction.currentHighestBid.toLocaleString()}`,
        auction: auction._id,
        metadata: {
          bidAmount: auction.currentHighestBid,
          auctionTitle: auction.auctionTitle,
          carDetails: carDetails
        }
      })
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating auction ending soon notifications:', error);
  }
};

/**
 * Create notification for auction creator when new bid is placed
 * @param {Object} bid - The bid object
 * @param {Object} auction - The auction object
 */
const createNewBidOnAuctionNotification = async (bid, auction) => {
  try {
    // Don't notify if the auction creator is the bidder
    if (auction.createdBy.toString() === bid.bidder.toString()) {
      return;
    }

    // Get car details
    const populatedAuction = await Auction.findById(auction._id).populate({
      path: 'car',
      populate: [
        { path: 'make', select: 'name' },
        { path: 'model', select: 'name' }
      ]
    });

    const carDetails = `${populatedAuction.car.make.name} ${populatedAuction.car.model.name}`;

    await createNotification({
      user: auction.createdBy,
      type: 'new_bid_on_auction',
      title: 'New Bid on Your Auction',
      description: `Someone placed a bid of AED ${bid.amount.toLocaleString()} on your auction: ${auction.auctionTitle}`,
      auction: auction._id,
      bid: bid._id,
      metadata: {
        bidAmount: bid.amount,
        auctionTitle: auction.auctionTitle,
        carDetails: carDetails
      }
    });
  } catch (error) {
    console.error('Error creating new bid on auction notification:', error);
  }
};

/**
 * Create notifications for new auction creation and send push notifications to all users
 * @param {Object} auction - The newly created auction object
 */
const createNewAuctionNotifications = async (auction) => {
  try {
    // Get auction with car details populated
    const populatedAuction = await Auction.findById(auction._id).populate({
      path: 'car',
      populate: [
        { path: 'make', select: 'name' },
        { path: 'model', select: 'name' }
      ]
    }).populate('createdBy', 'firstName lastName');

    const carDetails = `${populatedAuction.car.make.name} ${populatedAuction.car.model.name}`;
    const creatorName = `${populatedAuction.createdBy.firstName} ${populatedAuction.createdBy.lastName}`;

    // Get all users (excluding the auction creator)
    const allUsers = await User.find({
      _id: { $ne: auction.createdBy } // Exclude auction creator
    }).select('_id firstName lastName email notificationToken');

    if (allUsers.length === 0) {
      console.log('No users found for new auction notification');
      return;
    }

    console.log(`Creating new auction notifications for ${allUsers.length} users`);

    // Create in-app notifications for all users
    const notificationPromises = allUsers.map(user => 
      createNotification({
        user: user._id,
        type: 'new_auction_created',
        title: 'New Auction Available!',
        description: `A new auction for ${auction.auctionTitle} (${carDetails}) has started. Starting price: AED ${auction.startingPrice.toLocaleString()}`,
        auction: auction._id,
        metadata: {
          auctionTitle: auction.auctionTitle,
          carDetails: carDetails,
          startingPrice: auction.startingPrice,
          creatorName: creatorName
        }
      })
    );

    await Promise.all(notificationPromises);

    // Send email notifications to all users
    // DISABLED: Auction activity emails disabled as requested
    /*
    const emailPromises = allUsers.map(async (user) => {
      try {
        if (user.email) {
          await sendNewAuctionEmail(
            user.email,
            auction.auctionTitle,
            carDetails,
            auction.startingPrice,
            auction.endTime
          );
          console.log(`New auction email sent to ${user.email} for auction ${auction._id}`);
        }
      } catch (emailError) {
        console.error(`Error sending new auction email to ${user.email}:`, emailError);
        // Don't fail if individual email fails
      }
    });

    await Promise.all(emailPromises);
    */

    // Send push notifications in the background
    setImmediate(async () => {
      try {
        const usersWithTokens = allUsers.filter(user => user.notificationToken);
        if (usersWithTokens.length > 0) {
          console.log(`🚀 Initiating push notifications for new auction ${auction._id} to ${usersWithTokens.length} users`);
          const { sendPushNotificationToUsersForNewAuction } = require('./pushNotificationService');
          const results = await sendPushNotificationToUsersForNewAuction(auction, populatedAuction, carDetails, usersWithTokens);
          console.log(`📊 Push notification results for auction ${auction._id}:`, {
            total: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
          });
        }
      } catch (pushError) {
        console.error('❌ Error sending push notifications for new auction:', pushError);
        console.error('Push notification error details:', pushError.stack);
      }
    });

  } catch (error) {
    console.error('Error creating new auction notifications:', error);
  }
};

/**
 * Create notifications for re-auctioning an ended auction and send push notifications to all bidders
 * @param {Object} auction - The re-auctioned auction object
 */
const createReauctionNotifications = async (auction) => {
  try {
    // Get auction with car details populated
    const populatedAuction = await Auction.findById(auction._id).populate({
      path: 'car',
      populate: [
        { path: 'make', select: 'name' },
        { path: 'model', select: 'name' }
      ]
    }).populate('createdBy', 'firstName lastName');

    const carDetails = `${populatedAuction.car.make.name} ${populatedAuction.car.model.name}`;

    // Find all users who have previously bid on this auction
    const previousBids = await Bid.find({
      auction: auction._id,
    }).populate('bidder', 'firstName lastName email notificationToken');

    // Get unique bidders
    const uniqueBidders = [...new Map(previousBids.map(bid => [bid.bidder._id.toString(), bid.bidder])).values()];

    if (uniqueBidders.length === 0) {
      console.log('No previous bidders found for re-auction notification');
      return;
    }

    console.log(`Creating re-auction notifications for ${uniqueBidders.length} bidders`);

    // Create in-app notifications for all previous bidders
    const notificationPromises = uniqueBidders.map(bidder => 
      createNotification({
        user: bidder._id,
        type: 'new_auction_created',
        title: 'Auction Re-opened!',
        description: `The auction for ${auction.auctionTitle} (${carDetails}) has been re-opened. Starting price: AED ${auction.startingPrice.toLocaleString()}`,
        auction: auction._id,
        metadata: {
          auctionTitle: auction.auctionTitle,
          carDetails: carDetails,
          startingPrice: auction.startingPrice,
          isReauction: true
        }
      })
    );

    await Promise.all(notificationPromises);

    // Send push notifications to all previous bidders
    setImmediate(async () => {
      try {
        const biddersWithTokens = uniqueBidders.filter(bidder => bidder.notificationToken);
        if (biddersWithTokens.length > 0) {
          console.log(`🚀 Initiating push notifications for re-auction ${auction._id} to ${biddersWithTokens.length} bidders`);
          
          // Calculate auction end time for better description
          const endTime = new Date(auction.endTime);
          const now = new Date();
          const durationHours = Math.ceil((endTime - now) / (1000 * 60 * 60));

          const { sendPushNotificationsToUsers } = require('./pushNotificationService');
          
          // Prepare notification data
          const notificationData = {
            title: "Auction Re-opened! 🔄",
            body: `${carDetails} auction is back! Starting bid: AED ${auction.startingPrice.toLocaleString()}. Auction ends in ${durationHours}h.`,
            sound: "default",
            data: {
              type: "auction_reopened",
              auctionId: auction._id.toString(),
              auctionTitle: auction.auctionTitle,
              carDetails: carDetails,
              startingPrice: auction.startingPrice,
              endTime: auction.endTime.toISOString(),
              auctionType: auction.type,
              isReauction: true,
            },
          };

          // Extract user IDs from bidders with tokens
          const userIds = biddersWithTokens.map((bidder) => bidder._id.toString());

          const results = await sendPushNotificationsToUsers(userIds, notificationData);
          console.log(`📊 Push notification results for re-auction ${auction._id}:`, {
            total: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
          });
        }
      } catch (pushError) {
        console.error('❌ Error sending push notifications for re-auction:', pushError);
        console.error('Push notification error details:', pushError.stack);
      }
    });

  } catch (error) {
    console.error('Error creating re-auction notifications:', error);
  }
};

module.exports = {
  createNotification,
  createBidPlacedNotification,
  createOutbidNotifications,
  createAuctionWonNotification,
  createAuctionLostNotifications,
  createAuctionEndingSoonNotifications,
  createNewBidOnAuctionNotification,
  createNewAuctionNotifications,
  createReauctionNotifications
}; 