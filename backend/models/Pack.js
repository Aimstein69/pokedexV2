const mongoose = require("mongoose");

const packSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["Starter", "Standard", "Premium", "Legendary"],
    },
    price: {
      type: Number,
      required: true,
    },
    cardsCount: {
      type: Number,
      default: 5,
    },
    description: String,
    image: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    opened: {
      type: Boolean,
      default: false,
    },
    cards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pack", packSchema);
