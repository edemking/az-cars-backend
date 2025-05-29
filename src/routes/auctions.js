const express = require('express');
const {
  createAuction,
  getAuctions,
  getAuction,
  updateAuction,
  deleteAuction,
  placeBid,
  getUserAuctions,
  getUserBids,
  getAuctionBids,
  getAuctionsByType,
  getNewLiveAuctions,
  getEndingSoonAuctions,
  getDashboardData,
  getAuctionStats,
  getAuctionResults,
  getSoldAuctions,
  getUnsoldAuctions,
  getCompletedAuctions
} = require('../controllers/auctionController');

// Import the auction scheduler
const { checkCompletedAuctions } = require('../utils/auctionScheduler');

const router = express.Router();

// Import middleware
// const { protect, authorize } = require('../middleware/auth');
const { protect } = require('../middleware/auth');

// Routes
router.route('/')
  .get(getAuctions)
  .post(protect, createAuction);

router.route('/user')
  .get(protect, getUserAuctions);

router.route('/mybids')
  .get(protect, getUserBids);

// Admin route to manually check completed auctions
router.route('/check-completed')
  // .get(protect, authorize('admin'), async (req, res) => {
  .get(protect, async (req, res) => {
    await checkCompletedAuctions();
    res.status(200).json({ success: true, message: 'Auction completion check triggered' });
  });

// New routes for filtering auctions - MUST be placed before /:id routes
router.route('/type/:type')
  .get(getAuctionsByType);

router.route('/new-live')
  .get(getNewLiveAuctions);

router.route('/ending-soon')
  .get(getEndingSoonAuctions);

router.route('/sold')
  .get(getSoldAuctions);

router.route('/unsold')
  .get(getUnsoldAuctions);

router.route('/completed')
  .get(getCompletedAuctions);

router.route('/dashboard')
  .get(protect, getDashboardData);

// Parameterized routes should come AFTER specific routes
router.route('/:id')
  .get(getAuction)
  .put(protect, updateAuction)
  .delete(protect, deleteAuction);

router.route('/:id/bid')
  .post(protect, placeBid);

router.route('/:id/bids')
  .get(getAuctionBids);

router.route('/:id/stats')
  .get(getAuctionStats);

router.route('/:id/results')
  .get(getAuctionResults);

module.exports = router; 