const mongoose = require("mongoose");

const AuctionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["timedAuction", "noReserve", "buyNow"],
      required: true,
    },
    duration: {
      hours: {
        type: Number,
        default: 0,
      },
      minutes: {
        type: Number,
        default: 0,
      },
      seconds: {
        type: Number,
        default: 0,
      },
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    auctionTitle: {
      type: String,
      required: true,
      trim: true,
    },
    startingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    bidIncrement: {
      type: Number,
      required: true,
      min: 0,
    },
    auctionDescription: {
      type: String,
      required: true,
    },
    buyNowPrice: {
      type: Number,
      min: 0,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled", "deleted"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentHighestBid: {
      type: Number,
      default: 0,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    totalBids: {
      type: Number,
      default: 0,
    },
    auctionStatus: {
      type: String,
      enum: ["Car Sold", "Car Bought", "Following Up"],
      default: "Car Bought",
    },
    // Deletion tracking fields
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deletedAt: {
      type: Date,
    },
    deletionReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Calculate end time before saving
AuctionSchema.pre("save", function (next) {
  // Calculate end time based on duration and start time
  // Either when the document is new or when duration or start time is modified
  if (
    this.isNew ||
    this.isModified("duration") ||
    this.isModified("startTime")
  ) {
    const durationMs =
      this.duration.hours * 60 * 60 * 1000 +
      this.duration.minutes * 60 * 1000 +
      this.duration.seconds * 1000;

    this.endTime = new Date(this.startTime.getTime() + durationMs);
  }
  next();
});

module.exports = mongoose.model("Auction", AuctionSchema);
