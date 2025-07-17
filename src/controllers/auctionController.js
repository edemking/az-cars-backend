const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const Car = require("../models/cars/Car");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const {
  emitNewBid,
  emitAuctionUpdate,
  emitAuctionCompleted,
  getAuctionRoomClients,
} = require("../utils/socketEvents");
const {
  createBidPlacedNotification,
  createOutbidNotifications,
  createAuctionWonNotification,
  createAuctionLostNotifications,
  createNewBidOnAuctionNotification,
  createNewAuctionNotifications,
  createReauctionNotifications,
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

  // Send new auction notifications in the background
  setImmediate(async () => {
    try {
      await createNewAuctionNotifications(auction);
      console.log(
        `New auction notifications triggered for auction ${auction._id}`
      );
    } catch (notificationError) {
      console.error(
        "Error creating new auction notifications:",
        notificationError
      );
      // Don't fail auction creation if notifications fail
    }
  });

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
      select:
        "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
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
          path: "fuelType",
          select: "name category description",
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
    .populate("winner", "firstName lastName")
    .sort({ createdAt: -1 });

  // Add sold/unsold status to each auction
  const auctionsWithStatus = auctions.map((auction) => {
    const auctionObj = auction.toObject();

    // Determine sale status
    if (auctionObj.status === "completed") {
      auctionObj.saleStatus = auctionObj.winner ? "sold" : "unsold";
    } else if (auctionObj.status === "cancelled") {
      auctionObj.saleStatus = "unsold";
    } else {
      auctionObj.saleStatus = "active"; // For active auctions
    }

    return auctionObj;
  });

  sendSuccess(res, {
    data: auctionsWithStatus,
    meta: {
      count: auctionsWithStatus.length,
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
          path: "make",
        },
        {
          path: "model",
        },
        {
          path: "carDrive",
        },
        {
          path: "bodyColor",
        },
        {
          path: "carOptions",
        },
        {
          path: "fuelType",
        },
        {
          path: "serviceHistory",
        },
        {
          path: "country",
        },
        {
          path: "transmission",
        },
        {
          path: "componentSummary.windows.rating",
        },
        {
          path: "componentSummary.tires.rating",
        },
        {
          path: "componentSummary.brakes.rating",
        },
        {
          path: "componentSummary.battery.rating",
        },
        {
          path: "componentSummary.engine.rating",
        },
        {
          path: "componentSummary.transmission.rating",
        },
        {
          path: "componentSummary.suspension.rating",
        },
        {
          path: "componentSummary.body.rating",
        },
        {
          path: "componentSummary.interior.rating",
        },
        {
          path: "componentSummary.exterior.rating",
        },
        {
          path: "componentSummary.ac.rating",
        },
        {
          path: "componentSummary.electrical.rating",
        },
        {
          path: "componentSummary.centralLock.rating",
        },
        {
          path: "componentSummary.audio.rating",
        },
        {
          path: "componentSummary.navigation.rating",
        },
        {
          path: "componentSummary.seats.rating",
        },
        {
          path: "componentSummary.sunroof.rating",
        },
        {
          path: "componentSummary.paint.rating",
        },
        {
          path: "componentSummary.dashboard.rating",
        },
        {
          path: "componentSummary.lights.rating",
        },
        {
          path: "componentSummary.steering.rating",
        },
        {
          path: "componentSummary.exhaust.rating",
        },
        {
          path: "componentSummary.clutch.rating",
        },
        {
          path: "interiorAndExterior.frontBumber.condition",
        },
        {
          path: "interiorAndExterior.bonnet.condition",
        },
        {
          path: "interiorAndExterior.roof.condition",
        },
        {
          path: "interiorAndExterior.reerBumber.condition",
        },
        {
          path: "interiorAndExterior.driverSideFrontWing.condition",
        },
        {
          path: "interiorAndExterior.driverSideFrontDoor.condition",
        },
        {
          path: "interiorAndExterior.driverSideRearDoor.condition",
        },
        {
          path: "interiorAndExterior.driverRearQuarter.condition",
        },
        {
          path: "interiorAndExterior.passengerSideFrontWing.condition",
        },
        {
          path: "interiorAndExterior.passengerSideFrontDoor.condition",
        },
        {
          path: "interiorAndExterior.passengerSideRearDoor.condition",
        },
        {
          path: "interiorAndExterior.passengerRearQuarter.condition",
        },
        {
          path: "interiorAndExterior.driverSideFrontTyre.condition",
        },
        {
          path: "interiorAndExterior.driverSideRearTyre.condition",
        },
        {
          path: "interiorAndExterior.passengerSideFrontTyre.condition",
        },
        {
          path: "interiorAndExterior.passengerSideRearTyre.condition",
        },
        {
          path: "interiorAndExterior.trunk.condition",
        },
        {
          path: "interiorAndExterior.frontGlass.condition",
        },
        {
          path: "interiorAndExterior.rearGlass.condition",
        },
        {
          path: "interiorAndExterior.leftGlass.condition",
        },
        {
          path: "interiorAndExterior.rightGlass.condition",
        },
      ],
    })
    .populate("createdBy", "firstName lastName profilePicture")
    .populate("winner", "firstName lastName profilePicture");

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  // Get bids for this auction
  const bids = await Bid.find({ auction: req.params.id })
    .populate("bidder", "firstName lastName profilePicture")
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
    isWinningBid: true,
  });

  // Set all other bids for this auction to not be winning bids
  await Bid.updateMany(
    {
      auction: auction._id,
      _id: { $ne: bid._id }, // Exclude the current bid
    },
    {
      $set: { isWinningBid: false },
    }
  );

  // Populate the bid with bidder information for real-time updates
  await bid.populate("bidder", "firstName lastName");

  // Update auction with new highest bid
  auction.currentHighestBid = amount;
  auction.totalBids += 1;

  // If this is a buyNow auction and the bid matches or exceeds the buyNow price
  if (auction.type === "buyNow" && amount >= auction.buyNowPrice) {
    auction.status = "completed";
    auction.winner = req.user.id;
    await bid.save();

    // Emit auction completion event
    emitAuctionCompleted(auction._id.toString(), {
      winner: req.user,
      finalBid: bid,
      auction: auction,
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
      winner: auction.winner,
    },
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
    console.error("Error creating notifications:", notificationError);
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

// @desc    Buy now - immediately win auction at buyNow price
// @route   POST /api/auctions/:id/buy-now
// @access  Private
exports.buyNowAuction = asyncHandler(async (req, res, next) => {
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
    return next(new ErrorResponse("You cannot buy your own auction", 400));
  }

  // Check if buyNowPrice is set
  if (!auction.buyNowPrice || auction.buyNowPrice <= 0) {
    return next(
      new ErrorResponse("This auction does not have a buy now price set", 400)
    );
  }

  const buyNowAmount = auction.buyNowPrice;

  // Create new bid at buy now price
  const bid = await Bid.create({
    auction: auction._id,
    bidder: req.user.id,
    amount: buyNowAmount,
    time: new Date(),
    isWinningBid: true,
  });

  // Set all other bids for this auction to not be winning bids
  await Bid.updateMany(
    {
      auction: auction._id,
      _id: { $ne: bid._id }, // Exclude the current bid
    },
    {
      $set: { isWinningBid: false },
    }
  );

  // Populate the bid with bidder information for real-time updates
  await bid.populate("bidder", "firstName lastName");

  // Complete the auction immediately
  auction.status = "completed";
  auction.winner = req.user.id;
  auction.currentHighestBid = buyNowAmount;
  auction.totalBids += 1;

  await auction.save();

  // Emit auction completion event
  emitAuctionCompleted(auction._id.toString(), {
    winner: req.user,
    finalBid: bid,
    auction: auction,
  });

  // Create notifications
  try {
    // Create bid placed notification
    await createBidPlacedNotification(bid, auction);

    // Create outbid notifications for other bidders
    await createOutbidNotifications(bid, auction);

    // Create new bid notification for auction creator
    await createNewBidOnAuctionNotification(bid, auction);

    // Create win/loss notifications
    await createAuctionWonNotification(auction, bid);
    await createAuctionLostNotifications(auction, bid);
  } catch (notificationError) {
    console.error("Error creating notifications:", notificationError);
    // Don't fail the buy now if notifications fail
  }

  sendSuccess(res, {
    message: "Auction purchased successfully",
    data: {
      auction,
      bid,
      purchaseAmount: buyNowAmount,
    },
  });
});

// @desc    Get auctions created by user
// @route   GET /api/auctions/user
// @access  Private
exports.getUserAuctions = asyncHandler(async (req, res, next) => {
  const auctions = await Auction.find({ createdBy: req.user.id }).populate({
    path: "car",
    select:
      "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
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
        select:
          "make model year images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
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
    select:
      "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
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
    .populate("bidder", "firstName lastName profilePicture phoneNumber country")
    .sort({ amount: -1 });

  sendSuccess(res, {
    data: bids,
    meta: {
      count: bids.length,
    },
  });
});

// @desc    Get user's won bids with car information
// @route   GET /api/auctions/won-bids
// @access  Private
exports.getUserWonBids = asyncHandler(async (req, res, next) => {
  // Find all winning bids by the user first
  const userWinningBids = await Bid.find({
    bidder: req.user.id,
    isWinningBid: true,
  }).select("auction");

  const winningAuctionIds = userWinningBids.map((bid) => bid.auction);

  // Find all completed auctions where the user has winning bids
  const wonAuctions = await Auction.find({
    _id: { $in: winningAuctionIds },
    endTime: { $lt: new Date() },
    status: { $ne: "cancelled" },
  })
    .populate({
      path: "car",
      select:
        "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType description numberOfKeys warranty engineSize owner",
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

  // Get the winning bids for these auctions
  const auctionIds = wonAuctions.map((auction) => auction._id);
  const winningBids = await Bid.find({
    auction: { $in: auctionIds },
    bidder: req.user.id,
    isWinningBid: true,
  }).sort({ createdAt: -1 });

  // Format the response to include win date and winning amount
  const formattedWonBids = wonAuctions.map((auction) => {
    const correspondingBid = winningBids.find(
      (bid) => bid.auction.toString() === auction._id.toString()
    );

    return {
      bidId: correspondingBid?._id,
      winningAmount: correspondingBid?.amount || auction.currentHighestBid,
      bidTime: correspondingBid?.time,
      winDate: auction.updatedAt, // When auction was completed
      auction: {
        _id: auction._id,
        auctionTitle: auction.auctionTitle,
        startingPrice: auction.startingPrice,
        currentHighestBid: auction.currentHighestBid,
        endTime: auction.endTime,
        status: auction.status,
        type: auction.type,
        createdAt: auction.createdAt,
        car: auction.car,
      },
    };
  });

  sendSuccess(res, {
    data: {
      wonBids: formattedWonBids,
    },
    meta: {
      count: wonAuctions.length,
      totalWinnings: winningBids.reduce((total, bid) => total + bid.amount, 0),
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
      select:
        "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
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
  const now = new Date();

  const auctions = await Auction.find({
    status: "active",
    endTime: { $gt: now },
  })
    .populate({
      path: "car",
      select:
        "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
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
    .populate("createdBy", "firstName lastName profilePicture")
    .sort({ startTime: -1 });

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
      select:
        "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
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
    .populate("createdBy", "firstName lastName profilePicture")
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
  // Check if user is authenticated
  if (!req.user || !req.user.id) {
    return next(new ErrorResponse("User not authenticated", 401));
  }

  // Calculate date 24 hours from now for ending soon auctions
  const oneDayFromNow = new Date();
  oneDayFromNow.setHours(oneDayFromNow.getHours() + 24);

  const now = new Date();

  // Common populate structure
  const carPopulateConfig = {
    path: "car",
    select:
      "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
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
        path: "fuelType",
        select: "name category description",
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
  };

  // Get current auctions (not ended yet)
  let newLiveAuctions = await Auction.find({
    status: "active",
    endTime: { $gt: now },
  })
    .populate(carPopulateConfig)
    .populate("createdBy", "firstName lastName")
    .sort({ endTime: 1 }) // Sort by closest to ending
    .limit(3);

  // If no current auctions, get the most recent ended auction
  if (newLiveAuctions.length === 0) {
    const mostRecentAuction = await Auction.findOne({
      endTime: { $lt: now },
      status: { $ne: "cancelled" }, // Still exclude cancelled auctions
    })
      .populate(carPopulateConfig)
      .populate("createdBy", "firstName lastName")
      .populate("winner", "firstName lastName")
      .sort({ endTime: -1 });

    if (mostRecentAuction) {
      newLiveAuctions = [mostRecentAuction];
    }
  }

  // Get auctions ending soon (within next 24 hours)
  let endingSoonAuctions = await Auction.find({
    endTime: { $gt: now, $lte: oneDayFromNow },
  })
    .populate(carPopulateConfig)
    .populate("createdBy", "firstName lastName")
    .sort({ endTime: 1 })
    .limit(3);

  // If no ending soon auctions, get the most recent ended auction
  if (endingSoonAuctions.length === 0) {
    const mostRecentEndedAuction = await Auction.findOne({
      endTime: { $lt: now },
      status: { $ne: "cancelled" }, // Still exclude cancelled auctions
    })
      .populate(carPopulateConfig)
      .populate("createdBy", "firstName lastName")
      .populate("winner", "firstName lastName")
      .sort({ endTime: -1 });

    if (mostRecentEndedAuction) {
      endingSoonAuctions = [mostRecentEndedAuction];
    }
  }

  // Get user's won auctions based on winning bids and end time
  const userWinningBids = await Bid.find({
    bidder: req.user.id,
    isWinningBid: true,
  }).select("auction");

  const winningAuctionIds = userWinningBids.map((bid) => bid.auction);

  const wonAuctions = await Auction.find({
    _id: { $in: winningAuctionIds },
    endTime: { $lt: now },
    status: { $ne: "cancelled" }, // Still exclude cancelled auctions
  })
    .populate(carPopulateConfig)
    .sort({ endTime: -1 });

  sendSuccess(res, {
    data: {
      newLiveAuctions,
      endingSoonAuctions,
      wonAuctions,
    },
    meta: {
      fallbackUsed: {
        newLiveAuctions:
          newLiveAuctions.length > 0 && newLiveAuctions[0].endTime < now,
        endingSoonAuctions:
          endingSoonAuctions.length > 0 && endingSoonAuctions[0].endTime < now,
      },
    },
  });
});

// @desc    Get admin dashboard analytics data
// @route   GET /api/auctions/admin-dashboard
// @access  Private (Admin only)
exports.getAdminDashboardData = asyncHandler(async (req, res, next) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 1. Overall Statistics
  const [
    totalListedCars,
    totalBidders,
    liveAuctions,
    endedAuctions,
    totalAuctions,
  ] = await Promise.all([
    // Total cars in the system
    Car.countDocuments(),

    // Total unique bidders
    Bid.distinct("bidder").then((bidders) => bidders.length),

    // Live auctions count
    Auction.countDocuments({ status: "active", endTime: { $gt: now } }),

    // Ended auctions count
    Auction.countDocuments({ status: "completed" }),

    // Total auctions
    Auction.countDocuments(),
  ]);

  // 2. Daily auction activity for last 7 days
  const dailyAuctionActivity = await Auction.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // 3. Top performing auctions (by views and bids)
  const topPerformingAuctions = await Auction.find({
    createdAt: { $gte: thirtyDaysAgo },
  })
    .populate({
      path: "car",
      select: "make model year images fuelType engineSize",
      populate: [
        {
          path: "make",
          select: "name",
        },
        {
          path: "fuelType",
          select: "name",
        },
      ],
    })
    .sort({ totalBids: -1, currentHighestBid: -1 })
    .limit(10)
    .select("auctionTitle currentHighestBid totalBids status car createdAt");

  // 4. Top bidders analysis
  const topBidders = await Bid.aggregate([
    {
      $group: {
        _id: "$bidder",
        totalBids: { $sum: 1 },
        highestBid: { $max: "$amount" },
        totalBidAmount: { $sum: "$amount" },
        auctionsWon: {
          $sum: { $cond: [{ $eq: ["$isWinningBid", true] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "bidder",
      },
    },
    {
      $unwind: "$bidder",
    },
    {
      $project: {
        bidder: {
          _id: "$bidder._id",
          firstName: "$bidder.firstName",
          lastName: "$bidder.lastName",
          email: "$bidder.email",
          profilePicture: "$bidder.profilePicture",
          phoneNumber: "$bidder.phoneNumber",
          country: "$bidder.country",
        },
        totalBids: 1,
        highestBid: 1,
        totalBidAmount: 1,
        auctionsWon: 1,
      },
    },
    {
      $sort: { auctionsWon: -1, totalBids: -1, highestBid: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  // 5. Daily sales data for last 7 days
  const dailySalesData = await Auction.aggregate([
    {
      $match: {
        status: "completed",
        winner: { $exists: true },
        updatedAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
        },
        totalSales: { $sum: "$currentHighestBid" },
        salesCount: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // 6. Recent auction activity
  const recentAuctions = await Auction.find()
    .populate({
      path: "car",
      select: "make model year images fuelType engineSize",
      populate: [
        {
          path: "make",
          select: "name",
        },
        {
          path: "fuelType",
          select: "name",
        },
      ],
    })
    .populate("createdBy", "firstName lastName")
    .populate("winner", "firstName lastName")
    .sort({ createdAt: -1 })
    .limit(5)
    .select(
      "auctionTitle status currentHighestBid totalBids startTime endTime car createdBy winner"
    );

  // 7. Revenue analytics
  const totalRevenue = await Auction.aggregate([
    {
      $match: {
        status: "completed",
        winner: { $exists: true },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$currentHighestBid" },
      },
    },
  ]);

  const monthlyRevenue = await Auction.aggregate([
    {
      $match: {
        status: "completed",
        winner: { $exists: true },
        updatedAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$currentHighestBid" },
      },
    },
  ]);

  // Format response data
  const dashboardData = {
    // Overview statistics
    statistics: {
      totalListedCars,
      totalBidders,
      liveAuctions,
      endedAuctions,
      totalAuctions,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
    },

    // Charts data
    charts: {
      dailyAuctionActivity: dailyAuctionActivity.map((item) => ({
        date: item._id,
        count: item.count,
      })),
      dailySalesData: dailySalesData.map((item) => ({
        date: item._id,
        totalSales: item.totalSales,
        salesCount: item.salesCount,
      })),
    },

    // Performance data
    topPerformingAuctions: topPerformingAuctions.map((auction) => ({
      id: auction._id,
      title: auction.auctionTitle,
      carInfo: auction.car
        ? {
            make: auction.car.make?.name,
            model: auction.car.model,
            year: auction.car.year,
            image: auction.car.images?.[0],
            fuelType: auction.car.fuelType?.name,
            engineSize: auction.car.engineSize,
          }
        : null,
      currentHighestBid: auction.currentHighestBid,
      totalBids: auction.totalBids,
      status: auction.status,
      createdAt: auction.createdAt,
    })),

    // Top bidders
    topBidders: topBidders.map((bidder, index) => ({
      rank: index + 1,
      user: bidder.bidder,
      totalBids: bidder.totalBids,
      highestBid: bidder.highestBid,
      totalBidAmount: bidder.totalBidAmount,
      auctionsWon: bidder.auctionsWon,
    })),

    // Recent activity
    recentAuctions: recentAuctions.map((auction) => ({
      id: auction._id,
      title: auction.auctionTitle,
      status: auction.status,
      currentHighestBid: auction.currentHighestBid,
      totalBids: auction.totalBids,
      startTime: auction.startTime,
      endTime: auction.endTime,
      carInfo: auction.car
        ? {
            make: auction.car.make?.name,
            model: auction.car.model,
            year: auction.car.year,
            image: auction.car.images?.[0],
            fuelType: auction.car.fuelType?.name,
            engineSize: auction.car.engineSize,
          }
        : null,
      createdBy: auction.createdBy,
      winner: auction.winner,
    })),
  };

  sendSuccess(res, {
    message: "Admin dashboard data retrieved successfully",
    data: dashboardData,
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
    .populate("bidder", "firstName lastName profilePicture phoneNumber country")
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
      nextMinimumBid:
        auction.currentHighestBid > 0
          ? auction.currentHighestBid + auction.bidIncrement
          : auction.startingPrice,
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
          select: "name country logo",
        },
        {
          path: "model",
          select: "name startYear endYear image",
        },
        {
          path: "carDrive",
          select: "name type description",
        },
        {
          path: "bodyColor",
          select: "name hexCode type",
        },
        {
          path: "carOptions",
          select: "name category description",
        },
        {
          path: "fuelType",
          select: "name category description",
        },
        {
          path: "serviceHistory",
        },
        {
          path: "country",
          select: "name",
        },
        {
          path: "transmission",
          select: "name type gears description",
        },
        {
          path: "vehicleType",
          select: "name description",
        },
        {
          path: "componentSummary.windows",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.tires",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.brakes",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.battery",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.engine",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.transmission",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.suspension",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.body",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.interior",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.exterior",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.ac",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.electrical",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.centralLock",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.audio",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.navigation",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.seats",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.sunroof",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.paint",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.dashboard",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.lights",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.steering",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.exhaust",
          model: "Rating",
          select: "rating",
        },
        {
          path: "componentSummary.clutch",
          model: "Rating",
          select: "rating",
        },
        {
          path: "interiorAndExterior.frontBumber",
          model: "CarCondition",
          select: "condition",
        },
        {
          path: "interiorAndExterior.bonnet",
          model: "CarCondition",
          select: "condition",
        },
        {
          path: "interiorAndExterior.roof",
          model: "CarCondition",
          select: "condition",
        },
        {
          path: "interiorAndExterior.reerBumber",
          model: "CarCondition",
          select: "condition",
        },
        {
          path: "interiorAndExterior.driverSideFrontWing",
          model: "CarCondition",
          select: "condition",
        },
        {
          path: "interiorAndExterior.driverSideFrontDoor",
          model: "CarCondition",
          select: "condition",
        },
        {
          path: "interiorAndExterior.driverSideRearDoor",
          model: "CarCondition",
          select: "condition",
        },
        {
          path: "interiorAndExterior.driverRearQuarter",
          model: "CarCondition",
          select: "condition",
        },
        {
          path: "interiorAndExterior.passengerSideFrontWing",
          model: "CarCondition",
          select: "condition",
        },
        {
          path: "interiorAndExterior.passengerSideFrontDoor",
          model: "CarCondition",
          select: "condition",
        },
        {
          path: "interiorAndExterior.passengerSideRearDoor",
          model: "CarCondition",
          select: "condition",
        },
        {
          path: "interiorAndExterior.passengerRearQuarter",
          model: "CarCondition",
          select: "condition",
        },
      ],
    })
    .populate("createdBy", "firstName lastName email profilePicture")
    .populate(
      "winner",
      "firstName lastName email profilePicture phoneNumber, country"
    );

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  // Get all bids for this auction, sorted by amount (highest first)
  const allBids = await Bid.find({ auction: req.params.id })
    .populate(
      "bidder",
      "firstName lastName email profilePicture phoneNumber country"
    )
    .sort({ amount: -1, createdAt: 1 });

  // Get the winning bid (highest bid)
  const winningBid = allBids.length > 0 ? allBids[0] : null;

  // Get the bid winner details (same as auction.winner but with bid details)
  const bidWinner = winningBid
    ? {
        user: winningBid.bidder,
        winningAmount: winningBid.amount,
        bidTime: winningBid.createdAt,
        isWinningBid: winningBid.isWinningBid,
      }
    : null;

  // Calculate auction statistics
  const auctionStats = {
    totalBids: allBids.length,
    uniqueBidders: [...new Set(allBids.map((bid) => bid.bidder._id.toString()))]
      .length,
    startingPrice: auction.startingPrice,
    finalPrice: winningBid ? winningBid.amount : auction.startingPrice,
    priceIncrease: winningBid ? winningBid.amount - auction.startingPrice : 0,
    auctionDuration: {
      start: auction.startTime,
      end: auction.endTime,
      durationMs: auction.endTime - auction.startTime,
    },
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
        createdAt: auction.createdAt,
        updatedAt: auction.updatedAt,
      },
      carDetails: auction.car,
      bids: allBids,
      winningBid: winningBid,
      bidWinner: bidWinner,
      auctionStats: auctionStats,
    },
  });
});

// @desc    Get sold auctions (completed auctions with winners)
// @route   GET /api/auctions/sold
// @access  Public
exports.getSoldAuctions = asyncHandler(async (req, res, next) => {
  // Find completed auctions that have winners (sold cars)
  const soldAuctions = await Auction.find({
    status: "completed",
    winner: { $exists: true, $ne: null },
  })
    .populate({
      path: "car",
      select:
        "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
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
    .populate("createdBy", "firstName lastName profilePicture")
    .populate("winner", "firstName lastName email profilePicture")
    .sort({ endTime: -1 }); // Sort by most recently ended

  sendSuccess(res, {
    message: "Sold auctions retrieved successfully",
    data: soldAuctions,
    meta: {
      count: soldAuctions.length,
      type: "sold",
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
      { status: "cancelled" },
    ],
  })
    .populate({
      path: "car",
      select:
        "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
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
    .populate("createdBy", "firstName lastName profilePicture")
    .sort({ endTime: -1 }); // Sort by most recently ended

  sendSuccess(res, {
    message: "Unsold auctions retrieved successfully",
    data: unsoldAuctions,
    meta: {
      count: unsoldAuctions.length,
      type: "unsold",
    },
  });
});

// @desc    Get completed auctions (all auctions that have ended)
// @route   GET /api/auctions/completed
// @access  Public
exports.getCompletedAuctions = asyncHandler(async (req, res, next) => {
  const now = new Date();
  
  // Build query for completed auctions
  const query = {
    $or: [
      { status: "completed" },
      { endTime: { $lt: now } } // Auctions whose end time has passed
    ]
  };

  // Filter by auctionStatus if provided
  if (req.query.auctionStatus) {
    const validStatuses = ['Car Sold', 'Car Bought', 'Following Up'];
    if (!validStatuses.includes(req.query.auctionStatus)) {
      return next(
        new ErrorResponse(
          `Invalid auction status. Must be one of: ${validStatuses.join(', ')}`,
          400
        )
      );
    }
    query.auctionStatus = req.query.auctionStatus;
  }

  // Find all completed auctions (both sold and unsold)
  const completedAuctions = await Auction.find(query)
    .populate({
      path: "car",
      select:
        "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
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
    .populate("createdBy", "firstName lastName profilePicture")
    .populate("winner", "firstName lastName email profilePicture")
    .sort({ endTime: -1 }); // Sort by most recently ended

  // Separate sold and unsold for additional statistics
  const soldAuctions = completedAuctions.filter((auction) => auction.winner);
  const unsoldAuctions = completedAuctions.filter((auction) => !auction.winner);

  sendSuccess(res, {
    message: "Completed auctions retrieved successfully",
    data: completedAuctions,
    meta: {
      count: completedAuctions.length,
      type: "completed",
      soldCount: soldAuctions.length,
      unsoldCount: unsoldAuctions.length,
    },
  });
});

// @desc    Get completed auctions with all bidders populated
// @route   GET /api/auctions/completed-with-bidders
// @access  Public
exports.getCompletedAuctionsWithBidders = asyncHandler(
  async (req, res, next) => {
    // Find all completed auctions (both sold and unsold)
    const completedAuctions = await Auction.find({
      status: "completed",
    })
      .populate({
        path: "car",
        select:
          "make model year price images mileage carOptions bodyColor cylinder fuelType transmission carDrive country vehicleType",
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
      .populate("createdBy", "firstName lastName profilePicture")
      .populate("winner", "firstName lastName email profilePicture")
      .sort({ endTime: -1 });

    // Get auction IDs for bid lookup
    const auctionIds = completedAuctions.map((auction) => auction._id);

    // Get all bids for these auctions
    const allBids = await Bid.find({
      auction: { $in: auctionIds },
    })
      .populate(
        "bidder",
        "firstName lastName email profilePicture phoneNumber country"
      )
      .sort({ auction: 1, amount: -1 }); // Sort by auction, then highest bid first

    // Group bids by auction
    const bidsByAuction = {};
    allBids.forEach((bid) => {
      const auctionId = bid.auction.toString();
      if (!bidsByAuction[auctionId]) {
        bidsByAuction[auctionId] = [];
      }
      bidsByAuction[auctionId].push({
        _id: bid._id,
        amount: bid.amount,
        bidTime: bid.time,
        createdAt: bid.createdAt,
        isWinningBid: bid.isWinningBid,
        bidder: bid.bidder,
      });
    });

    // Combine auctions with their bidders
    const auctionsWithBidders = completedAuctions.map((auction) => {
      const auctionId = auction._id.toString();
      const auctionBids = bidsByAuction[auctionId] || [];

      // Calculate bidder statistics
      const uniqueBidders = [
        ...new Set(auctionBids.map((bid) => bid.bidder._id.toString())),
      ];
      const winningBid = auctionBids.find((bid) => bid.isWinningBid);

      return {
        _id: auction._id,
        auctionTitle: auction.auctionTitle,
        auctionDescription: auction.auctionDescription,
        type: auction.type,
        status: auction.status,
        startTime: auction.startTime,
        endTime: auction.endTime,
        startingPrice: auction.startingPrice,
        bidIncrement: auction.bidIncrement,
        buyNowPrice: auction.buyNowPrice,
        currentHighestBid: auction.currentHighestBid,
        totalBids: auction.totalBids,
        createdAt: auction.createdAt,
        updatedAt: auction.updatedAt,
        car: auction.car,
        createdBy: auction.createdBy,
        winner: auction.winner,

        // Bidder information
        allBidders: auctionBids,
        bidderStats: {
          totalBids: auctionBids.length,
          uniqueBidders: uniqueBidders.length,
          winningBid: winningBid,
          highestBid: auctionBids.length > 0 ? auctionBids[0].amount : null,
          bidRange:
            auctionBids.length > 0
              ? {
                  highest: Math.max(...auctionBids.map((b) => b.amount)),
                  lowest: Math.min(...auctionBids.map((b) => b.amount)),
                }
              : null,
        },
      };
    });

    // Overall statistics
    const soldAuctions = auctionsWithBidders.filter(
      (auction) => auction.winner
    );
    const unsoldAuctions = auctionsWithBidders.filter(
      (auction) => !auction.winner
    );
    const totalBids = auctionsWithBidders.reduce(
      (sum, auction) => sum + auction.bidderStats.totalBids,
      0
    );
    const totalUniqueBidders = [
      ...new Set(allBids.map((bid) => bid.bidder._id.toString())),
    ].length;

    sendSuccess(res, {
      message: "Completed auctions with bidders retrieved successfully",
      data: auctionsWithBidders,
      meta: {
        count: auctionsWithBidders.length,
        type: "completed_with_bidders",
        soldCount: soldAuctions.length,
        unsoldCount: unsoldAuctions.length,
        totalBids: totalBids,
        totalUniqueBidders: totalUniqueBidders,
      },
    });
  }
);

// @desc    Get all auction history (comprehensive historical data)
// @route   GET /api/auctions/history
// @access  Public
exports.getAllAuctionHistory = asyncHandler(async (req, res, next) => {
  // Get pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build query filters
  const queryFilters = {};

  // Filter by status if provided
  if (req.query.status) {
    queryFilters.status = req.query.status;
  }

  // Filter by type if provided
  if (req.query.type) {
    queryFilters.type = req.query.type;
  }

  // Filter by date range if provided
  if (req.query.startDate || req.query.endDate) {
    queryFilters.endTime = {};
    if (req.query.startDate) {
      queryFilters.endTime.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      queryFilters.endTime.$lte = new Date(req.query.endDate);
    }
  }

  // Get total count for pagination
  const total = await Auction.countDocuments(queryFilters);

  // Find auctions with comprehensive historical data
  const auctionsHistory = await Auction.find(queryFilters)
    .populate({
      path: "car",
      select: "make model year price images mileage bodyColor vehicleType",
      populate: [
        {
          path: "make",
          select: "name logo",
        },
        {
          path: "model",
          select: "name",
        },
        {
          path: "bodyColor",
          select: "name hexCode",
        },
        {
          path: "vehicleType",
          select: "name",
        },
      ],
    })
    .populate("createdBy", "firstName lastName")
    .populate("winner", "firstName lastName")
    .sort({ endTime: -1 })
    .skip(skip)
    .limit(limit);

  // Get auction IDs for bid statistics
  const auctionIds = auctionsHistory.map((auction) => auction._id);

  // Get bid statistics for all auctions
  const bidStats = await Bid.aggregate([
    { $match: { auction: { $in: auctionIds } } },
    {
      $group: {
        _id: "$auction",
        totalBids: { $sum: 1 },
        uniqueBidders: { $addToSet: "$bidder" },
        highestBid: { $max: "$amount" },
        lowestBid: { $min: "$amount" },
        averageBid: { $avg: "$amount" },
        lastBidTime: { $max: "$time" },
      },
    },
    {
      $addFields: {
        uniqueBiddersCount: { $size: "$uniqueBidders" },
      },
    },
  ]);

  // Create a map for quick lookup
  const bidStatsMap = {};
  bidStats.forEach((stat) => {
    bidStatsMap[stat._id.toString()] = {
      totalBids: stat.totalBids,
      uniqueBiddersCount: stat.uniqueBiddersCount,
      highestBid: stat.highestBid,
      lowestBid: stat.lowestBid,
      averageBid: Math.round(stat.averageBid * 100) / 100, // Round to 2 decimal places
      lastBidTime: stat.lastBidTime,
    };
  });

  // Combine auction data with bid statistics
  const enrichedHistory = auctionsHistory.map((auction) => {
    const auctionId = auction._id.toString();
    const stats = bidStatsMap[auctionId] || {
      totalBids: 0,
      uniqueBiddersCount: 0,
      highestBid: null,
      lowestBid: null,
      averageBid: null,
      lastBidTime: null,
    };

    const auctionObj = auction.toObject();

    // Determine sale status and final outcome
    let saleStatus = "active";
    let finalPrice = null;
    let profitLoss = null;

    if (auctionObj.status === "completed") {
      saleStatus = auctionObj.winner ? "sold" : "unsold";
      finalPrice = auctionObj.currentHighestBid;

      if (saleStatus === "sold" && auctionObj.car?.price) {
        profitLoss = finalPrice - auctionObj.car.price;
      }
    } else if (auctionObj.status === "cancelled") {
      saleStatus = "cancelled";
    }

    return {
      ...auctionObj,
      saleStatus,
      finalPrice,
      profitLoss,
      biddingStatistics: stats,
      duration:
        auctionObj.endTime && auctionObj.startTime
          ? Math.round(
              (new Date(auctionObj.endTime) - new Date(auctionObj.startTime)) /
                (1000 * 60 * 60 * 24)
            )
          : null, // Duration in days
    };
  });

  // Calculate summary statistics
  const summary = {
    totalAuctions: total,
    completedAuctions: enrichedHistory.filter((a) => a.status === "completed")
      .length,
    soldAuctions: enrichedHistory.filter((a) => a.saleStatus === "sold").length,
    unsoldAuctions: enrichedHistory.filter((a) => a.saleStatus === "unsold")
      .length,
    activeAuctions: enrichedHistory.filter((a) => a.status === "active").length,
    totalRevenue: enrichedHistory
      .filter((a) => a.saleStatus === "sold")
      .reduce((sum, a) => sum + (a.finalPrice || 0), 0),
    averageSalePrice: null,
  };

  if (summary.soldAuctions > 0) {
    summary.averageSalePrice = Math.round(
      summary.totalRevenue / summary.soldAuctions
    );
  }

  sendSuccess(res, {
    message: "Auction history retrieved successfully",
    data: enrichedHistory,
    meta: {
      count: enrichedHistory.length,
      totalCount: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
      summary,
    },
  });
});

// @desc    Get ended auction history (auctions that have ended based on end time)
// @route   GET /api/auctions/ended-history
// @access  Public
exports.getEndedAuctionHistory = asyncHandler(async (req, res, next) => {
  // Get pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build query filters with mandatory end time filter
  const now = new Date();
  const queryFilters = {
    endTime: { $lt: now }, // Only get auctions that have ended
  };

  // Filter by status if provided (but still must be ended)
  if (req.query.status) {
    queryFilters.status = req.query.status;
  }

  // Filter by type if provided
  if (req.query.type) {
    queryFilters.type = req.query.type;
  }

  // Filter by date range if provided (but still must be ended)
  if (req.query.startDate || req.query.endDate) {
    if (req.query.startDate) {
      queryFilters.endTime.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      queryFilters.endTime.$lte = new Date(req.query.endDate);
    }
  }

  // Get total count for pagination
  const total = await Auction.countDocuments(queryFilters);

  // Find ended auctions with comprehensive historical data
  const endedAuctions = await Auction.find(queryFilters)
    .populate({
      path: "car",
      select: "make model year price images mileage bodyColor vehicleType",
      populate: [
        {
          path: "make",
          select: "name logo",
        },
        {
          path: "model",
          select: "name",
        },
        {
          path: "bodyColor",
          select: "name hexCode",
        },
        {
          path: "vehicleType",
          select: "name",
        },
      ],
    })
    .populate("createdBy", "firstName lastName")
    .populate("winner", "firstName lastName")
    .sort({ endTime: -1 })
    .skip(skip)
    .limit(limit);

  // Get auction IDs for bid statistics
  const auctionIds = endedAuctions.map((auction) => auction._id);

  // Get bid statistics for all ended auctions
  const bidStats = await Bid.aggregate([
    { $match: { auction: { $in: auctionIds } } },
    {
      $group: {
        _id: "$auction",
        totalBids: { $sum: 1 },
        uniqueBidders: { $addToSet: "$bidder" },
        highestBid: { $max: "$amount" },
        lowestBid: { $min: "$amount" },
        averageBid: { $avg: "$amount" },
        lastBidTime: { $max: "$time" },
      },
    },
    {
      $addFields: {
        uniqueBiddersCount: { $size: "$uniqueBidders" },
      },
    },
  ]);

  // Create a map for quick lookup
  const bidStatsMap = {};
  bidStats.forEach((stat) => {
    bidStatsMap[stat._id.toString()] = {
      totalBids: stat.totalBids,
      uniqueBiddersCount: stat.uniqueBiddersCount,
      highestBid: stat.highestBid,
      lowestBid: stat.lowestBid,
      averageBid: Math.round(stat.averageBid * 100) / 100, // Round to 2 decimal places
      lastBidTime: stat.lastBidTime,
    };
  });

  // Combine auction data with bid statistics
  const enrichedHistory = endedAuctions.map((auction) => {
    const auctionId = auction._id.toString();
    const stats = bidStatsMap[auctionId] || {
      totalBids: 0,
      uniqueBiddersCount: 0,
      highestBid: null,
      lowestBid: null,
      averageBid: null,
      lastBidTime: null,
    };

    const auctionObj = auction.toObject();

    // Determine sale status and final outcome
    let saleStatus = "active";
    let finalPrice = null;
    let profitLoss = null;

    if (auctionObj.status === "completed") {
      saleStatus = auctionObj.winner ? "sold" : "unsold";
      finalPrice = auctionObj.currentHighestBid;

      if (saleStatus === "sold" && auctionObj.car?.price) {
        profitLoss = finalPrice - auctionObj.car.price;
      }
    } else if (auctionObj.status === "cancelled") {
      saleStatus = "cancelled";
    }

    return {
      ...auctionObj,
      saleStatus,
      finalPrice,
      profitLoss,
      biddingStatistics: stats,
      duration:
        auctionObj.endTime && auctionObj.startTime
          ? Math.round(
              (new Date(auctionObj.endTime) - new Date(auctionObj.startTime)) /
                (1000 * 60 * 60 * 24)
            )
          : null, // Duration in days
    };
  });

  // Calculate summary statistics for ended auctions
  const summary = {
    totalEndedAuctions: total,
    completedAuctions: enrichedHistory.filter((a) => a.status === "completed")
      .length,
    soldAuctions: enrichedHistory.filter((a) => a.saleStatus === "sold").length,
    unsoldAuctions: enrichedHistory.filter((a) => a.saleStatus === "unsold")
      .length,
    cancelledAuctions: enrichedHistory.filter((a) => a.status === "cancelled")
      .length,
    totalRevenue: enrichedHistory
      .filter((a) => a.saleStatus === "sold")
      .reduce((sum, a) => sum + (a.finalPrice || 0), 0),
    averageSalePrice: null,
  };

  if (summary.soldAuctions > 0) {
    summary.averageSalePrice = Math.round(
      summary.totalRevenue / summary.soldAuctions
    );
  }

  sendSuccess(res, {
    message: "Ended auction history retrieved successfully",
    data: enrichedHistory,
    meta: {
      count: enrichedHistory.length,
      totalCount: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
      summary,
    },
  });
});

// @desc    Get completed bids for a particular auction
// @route   GET /api/auctions/:id/completed-bids
// @access  Public
exports.getCompletedBidsForAuction = asyncHandler(async (req, res, next) => {
  // Check if auction exists
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  // Only return bids for auctions that have ended based on endTime
  const now = new Date();
  if (auction.endTime >= now) {
    return next(
      new ErrorResponse(
        `Cannot retrieve completed bids for an auction that hasn't ended yet. Auction ends at: ${auction.endTime}`,
        400
      )
    );
  }

  // Get all bids for this completed auction
  const completedBids = await Bid.find({ auction: req.params.id })
    .populate("bidder", "firstName lastName email profilePicture")
    .sort({ amount: -1, time: 1 }); // Sort by highest amount first, then by time

  // Calculate bidding statistics
  const biddingStats = {
    totalBids: completedBids.length,
    uniqueBidders: [
      ...new Set(completedBids.map((bid) => bid.bidder._id.toString())),
    ].length,
    highestBid:
      completedBids.length > 0
        ? Math.max(...completedBids.map((b) => b.amount))
        : null,
    lowestBid:
      completedBids.length > 0
        ? Math.min(...completedBids.map((b) => b.amount))
        : null,
    averageBid:
      completedBids.length > 0
        ? Math.round(
            (completedBids.reduce((sum, b) => sum + b.amount, 0) /
              completedBids.length) *
              100
          ) / 100
        : null,
    biddingTimespan: null,
    winningBid: completedBids.find((bid) => bid.isWinningBid) || null,
  };

  // Calculate bidding timespan
  if (completedBids.length > 0) {
    const firstBidTime = new Date(
      Math.min(...completedBids.map((b) => new Date(b.time)))
    );
    const lastBidTime = new Date(
      Math.max(...completedBids.map((b) => new Date(b.time)))
    );
    biddingStats.biddingTimespan = {
      firstBid: firstBidTime,
      lastBid: lastBidTime,
      durationMinutes: Math.round((lastBidTime - firstBidTime) / (1000 * 60)),
    };
  }

  // Group bids by bidder for additional insights
  const bidderActivity = {};
  completedBids.forEach((bid) => {
    const bidderId = bid.bidder._id.toString();
    if (!bidderActivity[bidderId]) {
      bidderActivity[bidderId] = {
        bidder: bid.bidder,
        bids: [],
        totalBids: 0,
        highestBid: 0,
        firstBidTime: bid.time,
        lastBidTime: bid.time,
      };
    }

    bidderActivity[bidderId].bids.push({
      _id: bid._id,
      amount: bid.amount,
      time: bid.time,
      isWinningBid: bid.isWinningBid,
    });
    bidderActivity[bidderId].totalBids++;
    bidderActivity[bidderId].highestBid = Math.max(
      bidderActivity[bidderId].highestBid,
      bid.amount
    );

    if (new Date(bid.time) < new Date(bidderActivity[bidderId].firstBidTime)) {
      bidderActivity[bidderId].firstBidTime = bid.time;
    }
    if (new Date(bid.time) > new Date(bidderActivity[bidderId].lastBidTime)) {
      bidderActivity[bidderId].lastBidTime = bid.time;
    }
  });

  // Convert bidder activity to array and sort by highest bid
  const bidderActivityArray = Object.values(bidderActivity).sort(
    (a, b) => b.highestBid - a.highestBid
  );

  sendSuccess(res, {
    message: "Completed bids retrieved successfully",
    data: {
      auction: {
        _id: auction._id,
        auctionTitle: auction.auctionTitle,
        status: auction.status,
        startTime: auction.startTime,
        endTime: auction.endTime,
        startingPrice: auction.startingPrice,
        currentHighestBid: auction.currentHighestBid,
        winner: auction.winner,
        type: auction.type,
      },
      bids: completedBids,
      biddingStatistics: biddingStats,
      bidderActivity: bidderActivityArray,
    },
    meta: {
      totalBids: completedBids.length,
      auctionStatus: auction.status,
      isCompleted: auction.status === "completed",
      hasBids: completedBids.length > 0,
    },
  });
});

// @desc    Re-auction an ended auction
// @route   POST /api/auctions/:id/reauction
// @access  Private
exports.reauctionAuction = asyncHandler(async (req, res, next) => {
  const { duration } = req.body;

  // Validate duration is provided
  if (!duration) {
    return next(new ErrorResponse("Please provide a duration", 400));
  }

  // Validate duration has at least one positive value
  if (
    (!duration.hours || duration.hours <= 0) &&
    (!duration.minutes || duration.minutes <= 0) &&
    (!duration.seconds || duration.seconds <= 0)
  ) {
    return next(
      new ErrorResponse(
        "Duration must have at least one positive value for hours, minutes, or seconds",
        400
      )
    );
  }

  // Find the auction
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return next(
      new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if auction has ended (endTime has passed)
  if (new Date() <= auction.endTime) {
    return next(
      new ErrorResponse("Cannot re-auction an auction that hasn't ended yet", 400)
    );
  }

  // Only auction creator or admin can re-auction
  if (
    auction.createdBy.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse("Not authorized to re-auction this auction", 401)
    );
  }

  // Update auction details
  auction.duration = {
    hours: duration.hours || 0,
    minutes: duration.minutes || 0,
    seconds: duration.seconds || 0,
  };

  // Reset auction status and times
  auction.status = "active";
  auction.startTime = new Date();
  auction.winner = undefined;

  // The pre-save hook will calculate the new endTime based on duration and startTime
  await auction.save();

  // Send re-auction notifications to all previous bidders
  setImmediate(async () => {
    try {
      await createReauctionNotifications(auction);
      console.log(
        `Re-auction notifications triggered for auction ${auction._id}`
      );
    } catch (notificationError) {
      console.error(
        "Error creating re-auction notifications:",
        notificationError
      );
      // Don't fail re-auction if notifications fail
    }
  });

  sendSuccess(res, {
    message: "Auction re-auctioned successfully",
    data: auction,
  });
});
