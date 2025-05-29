const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const Car = require("../models/cars/Car");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const { emitNewBid, emitAuctionUpdate, emitAuctionCompleted, getAuctionRoomClients } = require("../utils/socketEvents");
const {
  createBidPlacedNotification,
  createOutbidNotifications,
  createAuctionWonNotification,
  createAuctionLostNotifications,
  createNewBidOnAuctionNotification
} = require("../utils/notificationService");

// @desc    Create a new auction
// @route   POST /api/auctions
// @access  Private
exports.createAuction = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Remove endTime if provided, as it will be auto-calculated
  if (req.body.endTime) {
    delete req.body.endTime;
  }

  // Check if car exists
  const car = await Car.findById(req.body.car);
  if (!car) {
    return next(
      new ErrorResponse(`Car not found with id of ${req.body.car}`, 404)
    );
  }

  // Create auction
  const auction = await Auction.create(req.body);

  sendSuccess(res, {
    statusCode: 201,
    message: "Auction created successfully",
    data: auction,
  });
});

// @desc    Get all auctions
// @route   GET /api/auctions
// @access  Public
exports.getAuctions = asyncHandler(async (req, res, next) => {
  // Create query
  const query = {};

  // Filter by status if provided
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by type if provided
  if (req.query.type) {
    query.type = req.query.type;
  }

  // Find auctions
  const auctions = await Auction.find(query)
    .populate({
      path: "car",
      select: "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
      populate: [
        {
          path: "make",
          select: "name country logo",
        },
        {
          path: "model",
          select: "name startYear endYear image",
        },
        {
          path: "carOptions",
          select: "name category description",
        },
        {
          path: "bodyColor",
          select: "name hexCode type",
        },
        {
          path: "cylinder",
          select: "count configuration description",
        },
        {
          path: "fuelType",
          select: "name category description",
        },
        {
          path: "transmission",
          select: "name type gears description",
        },
        {
          path: "carDrive",
          select: "name type description",
        },
        {
          path: "country",
          select: "name",
        },
        {
          path: "vehicleType",
          select: "name description",
        },
      ],
    })
    .populate("createdBy", "firstName lastName");

  sendSuccess(res, {
    data: auctions,
    meta: {
      count: auctions.length,
    },
  });
});

// @desc    Get single auction
// @route   GET /api/auctions/:id
// @access  Public
exports.getAuction = asyncHandler(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id)
    .populate({
      path: "car",
      populate: [
        {
          path: "make"
        },
        {
          path: "model"
        },
        {
          path: "carDrive"
        },
        {
          path: "bodyColor"
        },
        {
          path: "carOptions"
        },
        {
          path: "fuelType"
        },
        {
          path: "cylinder"
        },
        {
          path: "serviceHistory"
        },
        {
          path: "country"
        },
        {
          path: "transmission"
        },
        {
          path: "componentSummary",
          populate: {
            path: "engine steering centralLock centralLocking interiorButtons gearbox dashLight audioSystem windowControl electricComponents acHeating dashboard roof breaks suspension gloveBox frontSeats exhaust clutch backSeat driveTrain",
            model: "Rating"
          }
        },
        {
          path: "interiorAndExterior",
          populate: {
            path: "frontBumber bonnet roof reerBumber driverSideFrontWing driverSideFrontDoor driverSideRearDoor driverRearQuarter passengerSideFrontWing passengerSideFrontDoor passengerSideRearDoor passengerRearQuarter driverSideFrontTyre driverSideRearTyre passengerSideFrontTyre passengerSideRearTyre trunk frontGlass rearGlass leftGlass rightGlass",
            model: "CarCondition"
          }
        }
      ]
    })
    .populate("createdBy", "firstName lastName")
    .populate("winner", "firstName lastName");

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  // Get bids for this auction
  const bids = await Bid.find({ auction: req.params.id })
    .populate("bidder", "firstName lastName")
    .sort({ amount: -1 });

  sendSuccess(res, {
    data: {
      ...auction._doc,
      bids,
    },
  });
});

// @desc    Update auction
// @route   PUT /api/auctions/:id
// @access  Private
exports.updateAuction = asyncHandler(async (req, res, next) => {
  let auction = await Auction.findById(req.params.id);

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is auction creator or admin
  if (
    auction.createdBy.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse("Not authorized to update this auction", 401)
    );
  }

  // Don't allow updating certain fields if auction has bids
  if (auction.totalBids > 0) {
    const protectedFields = ["type", "startingPrice", "car"];
    for (const field of protectedFields) {
      if (req.body[field]) {
        delete req.body[field];
      }
    }
  }

  // Remove endTime from the request as it will be auto-calculated based on duration and startTime
  if (req.body.endTime) {
    delete req.body.endTime;
  }

  auction = await Auction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, {
    message: "Auction updated successfully",
    data: auction,
  });
});

// @desc    Delete auction
// @route   DELETE /api/auctions/:id
// @access  Private
exports.deleteAuction = asyncHandler(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is auction creator or admin
  if (
    auction.createdBy.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse("Not authorized to delete this auction", 401)
    );
  }

  // Don't allow deletion if auction has bids
  if (auction.totalBids > 0) {
    return next(
      new ErrorResponse("Cannot delete auction with existing bids", 400)
    );
  }

  // Delete the auction
  await auction.deleteOne();

  sendSuccess(res, {
    message: "Auction deleted successfully",
  });
});

// @desc    Place bid on auction
// @route   POST /api/auctions/:id/bid
// @access  Private
exports.placeBid = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) {
    return next(new ErrorResponse("Please provide a bid amount", 400));
  }

  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if auction is active
  if (auction.status !== "active") {
    return next(new ErrorResponse("This auction is no longer active", 400));
  }

  // Check if auction has ended
  if (new Date() > auction.endTime) {
    return next(new ErrorResponse("This auction has ended", 400));
  }

  // Check if user is the creator of the auction
  if (auction.createdBy.toString() === req.user.id) {
    return next(new ErrorResponse("You cannot bid on your own auction", 400));
  }

  // Check if bid is higher than starting price
  if (amount < auction.startingPrice) {
    return next(
      new ErrorResponse(`Bid must be at least ${auction.startingPrice}`, 400)
    );
  }

  // Check if bid is higher than current highest bid + increment
  if (
    auction.currentHighestBid > 0 &&
    amount < auction.currentHighestBid + auction.bidIncrement
  ) {
    return next(
      new ErrorResponse(
        `Bid must be at least ${
          auction.currentHighestBid + auction.bidIncrement
        }`,
        400
      )
    );
  }

  // Create new bid
  const bid = await Bid.create({
    auction: auction._id,
    bidder: req.user.id,
    amount,
    time: new Date(),
  });

  // Populate the bid with bidder information for real-time updates
  await bid.populate("bidder", "firstName lastName");

  // Update auction with new highest bid
  auction.currentHighestBid = amount;
  auction.totalBids += 1;

  // If this is a buyNow auction and the bid matches or exceeds the buyNow price
  if (auction.type === "buyNow" && amount >= auction.buyNowPrice) {
    auction.status = "completed";
    auction.winner = req.user.id;
    bid.isWinningBid = true;
    await bid.save();
    
    // Emit auction completion event
    emitAuctionCompleted(auction._id.toString(), {
      winner: req.user,
      finalBid: bid,
      auction: auction
    });
  }

  await auction.save();

  // Emit real-time bid update to all clients watching this auction
  emitNewBid(auction._id.toString(), {
    bid: bid,
    auction: {
      _id: auction._id,
      currentHighestBid: auction.currentHighestBid,
      totalBids: auction.totalBids,
      status: auction.status,
      winner: auction.winner
    }
  });

  // If auction status changed, emit auction update
  if (auction.status === "completed") {
    emitAuctionUpdate(auction._id.toString(), auction);
  }

  // Create notifications
  try {
    // Create bid placed notification
    await createBidPlacedNotification(bid, auction);

    // Create outbid notifications for other bidders
    await createOutbidNotifications(bid, auction);

    // Create new bid notification for auction creator
    await createNewBidOnAuctionNotification(bid, auction);

    // If auction completed, create win/loss notifications
    if (auction.status === "completed") {
      await createAuctionWonNotification(auction, bid);
      await createAuctionLostNotifications(auction, bid);
    }
  } catch (notificationError) {
    console.error('Error creating notifications:', notificationError);
    // Don't fail the bid placement if notifications fail
  }

  sendSuccess(res, {
    message: "Bid placed successfully",
    data: {
      auction,
      bid,
    },
  });
});

// @desc    Get auctions created by user
// @route   GET /api/auctions/user
// @access  Private
exports.getUserAuctions = asyncHandler(async (req, res, next) => {
  const auctions = await Auction.find({ createdBy: req.user.id }).populate({
    path: "car",
    select: "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
    populate: [
      {
        path: "make",
        select: "name country logo",
      },
      {
        path: "model",
        select: "name startYear endYear image",
      },
      {
        path: "carOptions",
        select: "name category description",
      },
      {
        path: "bodyColor",
        select: "name hexCode type",
      },
      {
        path: "cylinder",
        select: "count configuration description",
      },
      {
        path: "fuelType",
        select: "name category description",
      },
      {
        path: "transmission",
        select: "name type gears description",
      },
      {
        path: "carDrive",
        select: "name type description",
      },
      {
        path: "country",
        select: "name",
      },
      {
        path: "vehicleType",
        select: "name description",
      },
    ],
  });

  sendSuccess(res, {
    data: auctions,
    meta: {
      count: auctions.length,
    },
  });
});

// @desc    Get auctions user has bid on
// @route   GET /api/auctions/mybids
// @access  Private
exports.getUserBids = asyncHandler(async (req, res, next) => {
  // Find all bids by the user
  const bids = await Bid.find({ bidder: req.user.id })
    .populate({
      path: "auction",
      select: "auctionTitle startingPrice currentHighestBid endTime status",
      populate: {
        path: "car",
        select: "make model year images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
        populate: [
          {
            path: "make",
            select: "name country logo",
          },
          {
            path: "model",
            select: "name startYear endYear image",
          },
          {
            path: "carOptions",
            select: "name category description",
          },
          {
            path: "bodyColor",
            select: "name hexCode type",
          },
          {
            path: "cylinder",
            select: "count configuration description",
          },
          {
            path: "fuelType",
            select: "name category description",
          },
          {
            path: "transmission",
            select: "name type gears description",
          },
          {
            path: "carDrive",
            select: "name type description",
          },
          {
            path: "country",
            select: "name",
          },
          {
            path: "vehicleType",
            select: "name description",
          },
        ],
      },
    })
    .sort({ createdAt: -1 });

  // Get unique auctions from bids
  const auctionIds = [
    ...new Set(bids.map((bid) => bid.auction._id.toString())),
  ];

  // Get the auctions
  const auctions = await Auction.find({ _id: { $in: auctionIds } }).populate({
    path: "car",
    select: "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
    populate: [
      {
        path: "make",
        select: "name country logo",
      },
      {
        path: "model",
        select: "name startYear endYear image",
      },
      {
        path: "carOptions",
        select: "name category description",
      },
      {
        path: "bodyColor",
        select: "name hexCode type",
      },
      {
        path: "cylinder",
        select: "count configuration description",
      },
      {
        path: "fuelType",
        select: "name category description",
      },
      {
        path: "transmission",
        select: "name type gears description",
      },
      {
        path: "carDrive",
        select: "name type description",
      },
      {
        path: "country",
        select: "name",
      },
      {
        path: "vehicleType",
        select: "name description",
      },
    ],
  });

  sendSuccess(res, {
    data: {
      auctions,
      bids,
    },
    meta: {
      count: auctions.length,
    },
  });
});

// @desc    Get all bids for an auction
// @route   GET /api/auctions/:id/bids
// @access  Public
exports.getAuctionBids = asyncHandler(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  const bids = await Bid.find({ auction: req.params.id })
    .populate("bidder", "firstName lastName")
    .sort({ amount: -1 });

  sendSuccess(res, {
    data: bids,
    meta: {
      count: bids.length,
    },
  });
});

// @desc    Get auctions by type (timedAuction, noReserve, buyNow)
// @route   GET /api/auctions/type/:type
// @access  Public
exports.getAuctionsByType = asyncHandler(async (req, res, next) => {
  const { type } = req.params;

  // Validate that type is one of the allowed values
  if (!["timedAuction", "noReserve", "buyNow"].includes(type)) {
    return next(new ErrorResponse(`Invalid auction type: ${type}`, 400));
  }

  const auctions = await Auction.find({
    type,
    status: "active",
    endTime: { $gt: new Date() },
  })
    .populate({
      path: "car",
      select: "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
      populate: [
        {
          path: "make",
          select: "name country logo",
        },
        {
          path: "model",
          select: "name startYear endYear image",
        },
        {
          path: "carOptions",
          select: "name category description",
        },
        {
          path: "bodyColor",
          select: "name hexCode type",
        },
        {
          path: "cylinder",
          select: "count configuration description",
        },
        {
          path: "fuelType",
          select: "name category description",
        },
        {
          path: "transmission",
          select: "name type gears description",
        },
        {
          path: "carDrive",
          select: "name type description",
        },
        {
          path: "country",
          select: "name",
        },
        {
          path: "vehicleType",
          select: "name description",
        },
      ],
    })
    .populate("createdBy", "firstName lastName")
    .sort({ startTime: -1 });

  sendSuccess(res, {
    data: auctions,
    meta: {
      count: auctions.length,
    },
  });
});

// @desc    Get new live auctions (started in the last 24 hours)
// @route   GET /api/auctions/new-live
// @access  Public
exports.getNewLiveAuctions = asyncHandler(async (req, res, next) => {
  // Calculate date 24 hours ago
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  const now = new Date();

  const auctions = await Auction.find({
    status: "active",
    startTime: { $gte: oneDayAgo },
    endTime: { $gt: now },
  })
    .populate({
      path: "car",
      select: "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
      populate: [
        {
          path: "make",
          select: "name country logo",
        },
        {
          path: "model",
          select: "name startYear endYear image",
        },
        {
          path: "carOptions",
          select: "name category description",
        },
        {
          path: "bodyColor",
          select: "name hexCode type",
        },
        {
          path: "cylinder",
          select: "count configuration description",
        },
        {
          path: "fuelType",
          select: "name category description",
        },
        {
          path: "transmission",
          select: "name type gears description",
        },
        {
          path: "carDrive",
          select: "name type description",
        },
        {
          path: "country",
          select: "name",
        },
        {
          path: "vehicleType",
          select: "name description",
        },
      ],
    })
    .populate("createdBy", "firstName lastName")
    .sort({ startTime: -1 })
    .limit(3);

  sendSuccess(res, {
    data: auctions,
    meta: {
      count: auctions.length,
    },
  });
});

// @desc    Get auctions ending soon (within the next 24 hours)
// @route   GET /api/auctions/ending-soon
// @access  Public
exports.getEndingSoonAuctions = asyncHandler(async (req, res, next) => {
  // Calculate date 24 hours from now
  const oneDayFromNow = new Date();
  oneDayFromNow.setHours(oneDayFromNow.getHours() + 24);

  const now = new Date();

  const auctions = await Auction.find({
    status: "active",
    endTime: { $gt: now, $lte: oneDayFromNow },
  })
    .populate({
      path: "car",
      select: "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
      populate: [
        {
          path: "make",
          select: "name country logo",
        },
        {
          path: "model",
          select: "name startYear endYear image",
        },
        {
          path: "carOptions",
          select: "name category description",
        },
        {
          path: "bodyColor",
          select: "name hexCode type",
        },
        {
          path: "cylinder",
          select: "count configuration description",
        },
        {
          path: "fuelType",
          select: "name category description",
        },
        {
          path: "transmission",
          select: "name type gears description",
        },
        {
          path: "carDrive",
          select: "name type description",
        },
        {
          path: "country",
          select: "name",
        },
        {
          path: "vehicleType",
          select: "name description",
        },
      ],
    })
    .populate("createdBy", "firstName lastName")
    .sort({ endTime: 1 }); // Sort by closest to ending

  sendSuccess(res, {
    data: auctions,
    meta: {
      count: auctions.length,
    },
  });
});

// @desc    Get combined auction data (3 new live, 3 ending soon, user's won auctions)
// @route   GET /api/auctions/dashboard
// @access  Private
exports.getDashboardData = asyncHandler(async (req, res, next) => {
  // Calculate date 24 hours ago
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  // Calculate date 24 hours from now
  const oneDayFromNow = new Date();
  oneDayFromNow.setHours(oneDayFromNow.getHours() + 24);

  const now = new Date();

  // Get 3 new live auctions
  const newLiveAuctions = await Auction.find({
    status: "active",
    startTime: { $gte: oneDayAgo },
    endTime: { $gt: now },
  })
    .populate({
      path: "car",
      select: "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
      populate: [
        {
          path: "make",
          select: "name country logo",
        },
        {
          path: "model",
          select: "name startYear endYear image",
        },
        {
          path: "carOptions",
          select: "name category description",
        },
        {
          path: "bodyColor",
          select: "name hexCode type",
        },
        {
          path: "cylinder",
          select: "count configuration description",
        },
        {
          path: "fuelType",
          select: "name category description",
        },
        {
          path: "transmission",
          select: "name type gears description",
        },
        {
          path: "carDrive",
          select: "name type description",
        },
        {
          path: "country",
          select: "name",
        },
        {
          path: "vehicleType",
          select: "name description",
        },
      ],
    })
    .populate("createdBy", "firstName lastName")
    .sort({ startTime: -1 })
    .limit(3);

  // Get 3 ending soon auctions
  const endingSoonAuctions = await Auction.find({
    status: "active",
    endTime: { $gt: now, $lte: oneDayFromNow },
  })
    .populate({
      path: "car",
      select: "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
      populate: [
        {
          path: "make",
          select: "name country logo",
        },
        {
          path: "model",
          select: "name startYear endYear image",
        },
        {
          path: "carOptions",
          select: "name category description",
        },
        {
          path: "bodyColor",
          select: "name hexCode type",
        },
        {
          path: "cylinder",
          select: "count configuration description",
        },
        {
          path: "fuelType",
          select: "name category description",
        },
        {
          path: "transmission",
          select: "name type gears description",
        },
        {
          path: "carDrive",
          select: "name type description",
        },
        {
          path: "country",
          select: "name",
        },
        {
          path: "vehicleType",
          select: "name description",
        },
      ],
    })
    .populate("createdBy", "firstName lastName")
    .sort({ endTime: 1 })
    .limit(3);

  // Get user's won auctions
  const wonAuctions = await Auction.find({
    winner: req.user.id,
    status: "completed",
  })
    .populate({
      path: "car",
      select: "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
      populate: [
        {
          path: "make",
          select: "name country logo",
        },
        {
          path: "model",
          select: "name startYear endYear image",
        },
        {
          path: "carOptions",
          select: "name category description",
        },
        {
          path: "bodyColor",
          select: "name hexCode type",
        },
        {
          path: "cylinder",
          select: "count configuration description",
        },
        {
          path: "fuelType",
          select: "name category description",
        },
        {
          path: "transmission",
          select: "name type gears description",
        },
        {
          path: "carDrive",
          select: "name type description",
        },
        {
          path: "country",
          select: "name",
        },
        {
          path: "vehicleType",
          select: "name description",
        },
      ],
    })
    .sort({ endTime: -1 });

  sendSuccess(res, {
    data: {
      newLiveAuctions,
      endingSoonAuctions,
      wonAuctions,
    },
  });
});

// @desc    Get real-time auction statistics
// @route   GET /api/auctions/:id/stats
// @access  Public
exports.getAuctionStats = asyncHandler(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  // Get connected clients count
  const connectedClients = await getAuctionRoomClients(req.params.id);

  // Get recent bids (last 5)
  const recentBids = await Bid.find({ auction: req.params.id })
    .populate("bidder", "firstName lastName")
    .sort({ createdAt: -1 })
    .limit(5);

  // Calculate time remaining
  const now = new Date();
  const timeRemaining = auction.endTime > now ? auction.endTime - now : 0;

  sendSuccess(res, {
    data: {
      auctionId: auction._id,
      status: auction.status,
      currentHighestBid: auction.currentHighestBid,
      totalBids: auction.totalBids,
      timeRemaining: timeRemaining,
      connectedClients: connectedClients,
      recentBids: recentBids,
      nextMinimumBid: auction.currentHighestBid > 0 
        ? auction.currentHighestBid + auction.bidIncrement 
        : auction.startingPrice
    },
  });
});

// @desc    Get auction results with complete details
// @route   GET /api/auctions/:id/results
// @access  Public
exports.getAuctionResults = asyncHandler(async (req, res, next) => {
  // Find the auction with complete car details
  const auction = await Auction.findById(req.params.id)
    .populate({
      path: "car",
      populate: [
        {
          path: "make",
          select: "name country logo"
        },
        {
          path: "model", 
          select: "name startYear endYear image"
        },
        {
          path: "carDrive",
          select: "name type description"
        },
        {
          path: "bodyColor",
          select: "name hexCode type"
        },
        {
          path: "carOptions",
          select: "name category description"
        },
        {
          path: "fuelType",
          select: "name category description"
        },
        {
          path: "cylinder",
          select: "count configuration description"
        },
        {
          path: "country",
          select: "name"
        },
        {
          path: "transmission",
          select: "name type gears description"
        },
        {
          path: "vehicleType",
          select: "name description"
        },
        {
          path: "componentSummary.engine",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.steering",
          model: "Rating", 
          select: "rating"
        },
        {
          path: "componentSummary.centralLock",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.centralLocking",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.interiorButtons",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.gearbox",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.dashLight",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.audioSystem",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.windowControl",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.electricComponents",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.acHeating",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.dashboard",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.roof",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.breaks",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.suspension",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.gloveBox",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.frontSeats",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.exhaust",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.clutch",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.backSeat",
          model: "Rating",
          select: "rating"
        },
        {
          path: "componentSummary.driveTrain",
          model: "Rating",
          select: "rating"
        },
        {
          path: "interiorAndExterior.frontBumber",
          model: "CarCondition",
          select: "condition"
        },
        {
          path: "interiorAndExterior.bonnet",
          model: "CarCondition",
          select: "condition"
        },
        {
          path: "interiorAndExterior.roof",
          model: "CarCondition",
          select: "condition"
        },
        {
          path: "interiorAndExterior.reerBumber",
          model: "CarCondition",
          select: "condition"
        },
        {
          path: "interiorAndExterior.driverSideFrontWing",
          model: "CarCondition",
          select: "condition"
        },
        {
          path: "interiorAndExterior.driverSideFrontDoor",
          model: "CarCondition",
          select: "condition"
        },
        {
          path: "interiorAndExterior.driverSideRearDoor",
          model: "CarCondition",
          select: "condition"
        },
        {
          path: "interiorAndExterior.driverRearQuarter",
          model: "CarCondition",
          select: "condition"
        },
        {
          path: "interiorAndExterior.passengerSideFrontWing",
          model: "CarCondition",
          select: "condition"
        },
        {
          path: "interiorAndExterior.passengerSideFrontDoor",
          model: "CarCondition",
          select: "condition"
        },
        {
          path: "interiorAndExterior.passengerSideRearDoor",
          model: "CarCondition",
          select: "condition"
        },
        {
          path: "interiorAndExterior.passengerRearQuarter",
          model: "CarCondition",
          select: "condition"
        }
      ]
    })
    .populate("createdBy", "firstName lastName email")
    .populate("winner", "firstName lastName email");

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  // Get all bids for this auction, sorted by amount (highest first)
  const allBids = await Bid.find({ auction: req.params.id })
    .populate("bidder", "firstName lastName email")
    .sort({ amount: -1, createdAt: 1 });

  // Get the winning bid (highest bid)
  const winningBid = allBids.length > 0 ? allBids[0] : null;

  // Get the bid winner details (same as auction.winner but with bid details)
  const bidWinner = winningBid ? {
    user: winningBid.bidder,
    winningAmount: winningBid.amount,
    bidTime: winningBid.createdAt,
    isWinningBid: winningBid.isWinningBid
  } : null;

  // Calculate auction statistics
  const auctionStats = {
    totalBids: allBids.length,
    uniqueBidders: [...new Set(allBids.map(bid => bid.bidder._id.toString()))].length,
    startingPrice: auction.startingPrice,
    finalPrice: winningBid ? winningBid.amount : auction.startingPrice,
    priceIncrease: winningBid ? winningBid.amount - auction.startingPrice : 0,
    auctionDuration: {
      start: auction.startTime,
      end: auction.endTime,
      durationMs: auction.endTime - auction.startTime
    }
  };

  sendSuccess(res, {
    message: "Auction results retrieved successfully",
    data: {
      auction: {
        id: auction._id,
        type: auction.type,
        auctionTitle: auction.auctionTitle,
        auctionDescription: auction.auctionDescription,
        status: auction.status,
        startTime: auction.startTime,
        endTime: auction.endTime,
        startingPrice: auction.startingPrice,
        bidIncrement: auction.bidIncrement,
        buyNowPrice: auction.buyNowPrice,
        currentHighestBid: auction.currentHighestBid,
        totalBids: auction.totalBids,
        createdBy: auction.createdBy,
        winner: auction.winner,
        createdAt: auction.createdAt,
        updatedAt: auction.updatedAt
      },
      carDetails: auction.car,
      bids: allBids,
      winningBid: winningBid,
      bidWinner: bidWinner,
      auctionStats: auctionStats
    }
  });
});

// @desc    Get sold auctions (completed auctions with winners)
// @route   GET /api/auctions/sold
// @access  Public
exports.getSoldAuctions = asyncHandler(async (req, res, next) => {
  // Find completed auctions that have winners (sold cars)
  const soldAuctions = await Auction.find({
    status: "completed",
    winner: { $exists: true, $ne: null }
  })
    .populate({
      path: "car",
      select: "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
      populate: [
        {
          path: "make",
          select: "name country logo",
        },
        {
          path: "model",
          select: "name startYear endYear image",
        },
        {
          path: "carOptions",
          select: "name category description",
        },
        {
          path: "bodyColor",
          select: "name hexCode type",
        },
        {
          path: "cylinder",
          select: "count configuration description",
        },
        {
          path: "fuelType",
          select: "name category description",
        },
        {
          path: "transmission",
          select: "name type gears description",
        },
        {
          path: "carDrive",
          select: "name type description",
        },
        {
          path: "country",
          select: "name",
        },
        {
          path: "vehicleType",
          select: "name description",
        },
      ],
    })
    .populate("createdBy", "firstName lastName")
    .populate("winner", "firstName lastName email")
    .sort({ endTime: -1 }); // Sort by most recently ended

  sendSuccess(res, {
    message: "Sold auctions retrieved successfully",
    data: soldAuctions,
    meta: {
      count: soldAuctions.length,
      type: "sold"
    },
  });
});

// @desc    Get unsold auctions (completed auctions without winners or cancelled)
// @route   GET /api/auctions/unsold
// @access  Public
exports.getUnsoldAuctions = asyncHandler(async (req, res, next) => {
  // Find completed auctions without winners or cancelled auctions (unsold cars)
  const unsoldAuctions = await Auction.find({
    $or: [
      { status: "completed", winner: { $exists: false } },
      { status: "completed", winner: null },
      { status: "cancelled" }
    ]
  })
    .populate({
      path: "car",
      select: "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
      populate: [
        {
          path: "make",
          select: "name country logo",
        },
        {
          path: "model",
          select: "name startYear endYear image",
        },
        {
          path: "carOptions",
          select: "name category description",
        },
        {
          path: "bodyColor",
          select: "name hexCode type",
        },
        {
          path: "cylinder",
          select: "count configuration description",
        },
        {
          path: "fuelType",
          select: "name category description",
        },
        {
          path: "transmission",
          select: "name type gears description",
        },
        {
          path: "carDrive",
          select: "name type description",
        },
        {
          path: "country",
          select: "name",
        },
        {
          path: "vehicleType",
          select: "name description",
        },
      ],
    })
    .populate("createdBy", "firstName lastName")
    .sort({ endTime: -1 }); // Sort by most recently ended

  sendSuccess(res, {
    message: "Unsold auctions retrieved successfully",
    data: unsoldAuctions,
    meta: {
      count: unsoldAuctions.length,
      type: "unsold"
    },
  });
});

// @desc    Get completed auctions (all auctions that have ended)
// @route   GET /api/auctions/completed
// @access  Public
exports.getCompletedAuctions = asyncHandler(async (req, res, next) => {
  // Find all completed auctions (both sold and unsold)
  const completedAuctions = await Auction.find({
    status: "completed"
  })
    .populate({
      path: "car",
      select: "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
      populate: [
        {
          path: "make",
          select: "name country logo",
        },
        {
          path: "model",
          select: "name startYear endYear image",
        },
        {
          path: "carOptions",
          select: "name category description",
        },
        {
          path: "bodyColor",
          select: "name hexCode type",
        },
        {
          path: "cylinder",
          select: "count configuration description",
        },
        {
          path: "fuelType",
          select: "name category description",
        },
        {
          path: "transmission",
          select: "name type gears description",
        },
        {
          path: "carDrive",
          select: "name type description",
        },
        {
          path: "country",
          select: "name",
        },
        {
          path: "vehicleType",
          select: "name description",
        },
      ],
    })
    .populate("createdBy", "firstName lastName")
    .populate("winner", "firstName lastName email")
    .sort({ endTime: -1 }); // Sort by most recently ended

  // Separate sold and unsold for additional statistics
  const soldAuctions = completedAuctions.filter(auction => auction.winner);
  const unsoldAuctions = completedAuctions.filter(auction => !auction.winner);

  sendSuccess(res, {
    message: "Completed auctions retrieved successfully",
    data: completedAuctions,
    meta: {
      count: completedAuctions.length,
      type: "completed",
      soldCount: soldAuctions.length,
      unsoldCount: unsoldAuctions.length
    },
  });
});
