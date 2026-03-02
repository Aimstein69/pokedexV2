const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    pokemonId: {
      type: Number,
      required: true,
    },
    pokemonName: {
      type: String,
      required: true,
    },
    pokemonImage: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "fire",
        "water",
        "grass",
        "electric",
        "ice",
        "fighting",
        "poison",
        "ground",
        "flying",
        "psychic",
        "bug",
        "rock",
        "ghost",
        "dragon",
        "dark",
        "steel",
        "fairy",
      ],
      required: true,
    },
    hp: {
      type: Number,
      default: 50,
    },
    attack: {
      type: Number,
      default: 50,
    },
    defense: {
      type: Number,
      default: 50,
    },
    speed: {
      type: Number,
      default: 50,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rarity: {
      type: String,
      enum: ["common", "uncommon", "rare", "legendary"],
      default: "common",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Card", cardSchema);
