/**
 * Socket.IO event handlers and utilities for real-time bid updates
 */

/**
 * Emit a new bid event to all clients in the auction room
 * @param {string} auctionId - The auction ID
 * @param {Object} bidData - The bid data to emit
 */
const emitNewBid = (auctionId, bidData) => {
  if (global.io) {
    // Create a sanitized bid object without bidder's name
    const sanitizedBid = {
      _id: bidData.bid._id,
      auction: bidData.bid.auction,
      bidder: bidData.bid.bidder ? bidData.bid.bidder._id : bidData.bid.bidder,
      amount: bidData.bid.amount,
      time: bidData.bid.time,
      isWinningBid: bidData.bid.isWinningBid,
    };

    global.io.to(`auction-${auctionId}`).emit("new-bid", {
      auctionId,
      bid: sanitizedBid,
      auction: bidData.auction,
      timestamp: new Date(),
    });
    console.log(`Emitted new bid event for auction ${auctionId}`);
  }
};

/**
 * Emit auction status update to all clients in the auction room
 * @param {string} auctionId - The auction ID
 * @param {Object} auctionData - The auction data to emit
 */
const emitAuctionUpdate = (auctionId, auctionData) => {
  if (global.io) {
    global.io.to(`auction-${auctionId}`).emit("auction-update", {
      auctionId,
      auction: auctionData,
      timestamp: new Date(),
    });
    console.log(`Emitted auction update event for auction ${auctionId}`);
  }
};

/**
 * Emit auction completion event to all clients in the auction room
 * @param {string} auctionId - The auction ID
 * @param {Object} completionData - The completion data to emit
 */
const emitAuctionCompleted = (auctionId, completionData) => {
  if (global.io) {
    // Create sanitized completion data without bidder's name
    const sanitizedWinner = completionData.winner
      ? {
          _id: completionData.winner._id || completionData.winner,
        }
      : null;

    const sanitizedFinalBid = completionData.finalBid
      ? {
          _id: completionData.finalBid._id,
          auction: completionData.finalBid.auction,
          bidder: completionData.finalBid.bidder
            ? completionData.finalBid.bidder._id ||
              completionData.finalBid.bidder
            : completionData.finalBid.bidder,
          amount: completionData.finalBid.amount,
          time: completionData.finalBid.time,
          isWinningBid: completionData.finalBid.isWinningBid,
        }
      : null;

    global.io.to(`auction-${auctionId}`).emit("auction-completed", {
      auctionId,
      winner: sanitizedWinner,
      finalBid: sanitizedFinalBid,
      auction: completionData.auction,
      timestamp: new Date(),
    });
    console.log(`Emitted auction completion event for auction ${auctionId}`);
  }
};

/**
 * Emit auction deletion event to all clients in the auction room
 * @param {string} auctionId - The auction ID
 * @param {Object} deletionData - The deletion data to emit
 */
const emitAuctionDeleted = (auctionId, deletionData) => {
  if (global.io) {
    // Create sanitized deletion data
    const sanitizedDeletedBy = deletionData.deletedBy
      ? {
          _id: deletionData.deletedBy._id || deletionData.deletedBy,
          firstName: deletionData.deletedBy.firstName,
          lastName: deletionData.deletedBy.lastName,
        }
      : null;

    global.io.to(`auction-${auctionId}`).emit("auction-deleted", {
      auctionId,
      reason: deletionData.reason,
      deletedBy: sanitizedDeletedBy,
      timestamp: new Date(),
    });
    console.log(`Emitted auction deletion event for auction ${auctionId}`);
  }
};

/**
 * Get the number of connected clients for an auction room
 * @param {string} auctionId - The auction ID
 * @returns {number} Number of connected clients
 */
const getAuctionRoomClients = async (auctionId) => {
  if (global.io) {
    const room = global.io.sockets.adapter.rooms.get(`auction-${auctionId}`);
    return room ? room.size : 0;
  }
  return 0;
};

module.exports = {
  emitNewBid,
  emitAuctionUpdate,
  emitAuctionCompleted,
  emitAuctionDeleted,
  getAuctionRoomClients,
};
