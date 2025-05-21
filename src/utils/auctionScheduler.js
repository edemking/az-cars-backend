const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

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
        .limit(1);
      
      // Set the winner as the highest bidder if there are bids
      if (highestBid) {
        auction.winner = highestBid.bidder;
        
        // Mark this as the winning bid
        highestBid.isWinningBid = true;
        await highestBid.save();
        
        console.log(`Auction ${auction._id} winner: ${highestBid.bidder}`);
      }
      
      // Update status to completed
      auction.status = 'completed';
      await auction.save();
      
      console.log(`Auction ${auction._id} marked as completed`);
    }
    
    console.log('Auction completion check finished');
  } catch (error) {
    console.error('Error in auction completion check:', error);
  }
};

module.exports = { checkCompletedAuctions }; 