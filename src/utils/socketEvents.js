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
    global.io.to(`auction-${auctionId}`).emit('new-bid', {
      auctionId,
      bid: bidData.bid,
      auction: bidData.auction,
      timestamp: new Date()
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
    global.io.to(`auction-${auctionId}`).emit('auction-update', {
      auctionId,
      auction: auctionData,
      timestamp: new Date()
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
    global.io.to(`auction-${auctionId}`).emit('auction-completed', {
      auctionId,
      winner: completionData.winner,
      finalBid: completionData.finalBid,
      auction: completionData.auction,
      timestamp: new Date()
    });
    console.log(`Emitted auction completion event for auction ${auctionId}`);
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
  getAuctionRoomClients
}; 