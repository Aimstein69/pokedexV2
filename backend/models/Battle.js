const mongoose = require("mongoose");

const battleSchema = new mongoose.Schema(
  {
    challenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    opponent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    challengerCards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card",
      },
    ],
    opponentCards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "accepted", "ongoing", "finished"],
      default: "pending",
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    result: {
      type: String,
      enum: ["win", "loss", "draw"],
    },
    moves: [
      {
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        card: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Card",
        },
        damage: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    finishedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Battle", battleSchema);
