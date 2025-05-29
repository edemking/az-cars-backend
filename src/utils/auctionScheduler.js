const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const { emitAuctionCompleted, emitAuctionUpdate } = require('./socketEvents');
const {
  createAuctionWonNotification,
  createAuctionLostNotifications
} = require('./notificationService');

/**
 * Check for completed auctions and update their status
 * This should be run as a scheduled job
 */
const checkCompletedAuctions = async () => {
  try {
    console.log('Running auction completion check...');
    
    // Find all active auctions that have passed their end time
    const now = new Date();
    const completedAuctions = await Auction.find({
      status: 'active',
      endTime: { $lt: now }
    });
    
    console.log(`Found ${completedAuctions.length} completed auctions`);
    
    // Update each auction
    for (const auction of completedAuctions) {
      // Find the highest bid for this auction
      const highestBid = await Bid.findOne({ auction: auction._id })
        .sort({ amount: -1 })
        .limit(1)
        .populate("bidder", "firstName lastName");
      
      // Set the winner as the highest bidder if there are bids
      if (highestBid) {
        auction.winner = highestBid.bidder;
        
        // Mark this as the winning bid
        highestBid.isWinningBid = true;
        await highestBid.save();
        
        console.log(`Auction ${auction._id} winner: ${highestBid.bidder._id}`);
        
        // Emit auction completion event
        emitAuctionCompleted(auction._id.toString(), {
          winner: highestBid.bidder,
          finalBid: highestBid,
          auction: auction
        });

        // Create notifications for auction completion
        try {
          // Create auction won notification
          await createAuctionWonNotification(auction, highestBid);
          
          // Create auction lost notifications for other bidders
          await createAuctionLostNotifications(auction, highestBid);
          
          console.log(`Notifications created for auction ${auction._id} completion`);
        } catch (notificationError) {
          console.error(`Error creating notifications for auction ${auction._id}:`, notificationError);
        }
      }
      
      // Update status to completed
      auction.status = 'completed';
      await auction.save();
      
      // Emit auction update event
      emitAuctionUpdate(auction._id.toString(), auction);
      
      console.log(`Auction ${auction._id} marked as completed`);
    }
    
    console.log('Auction completion check finished');
  } catch (error) {
    console.error('Error in auction completion check:', error);
  }
};

module.exports = { checkCompletedAuctions }; 