const mongoose = require("mongoose");

const battleSchema = new mongoose.Schema({
  // Les deux joueurs
  challenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  opponent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Cartes misées (pokemonId + snapshot des stats au moment du combat)
  challengerCards: [
    {
      pokemonId: Number,
      name: String,
      image: String,
      hp: Number,
      attack: Number,
      defense: Number,
      power: Number,
      rarity: String,
    },
  ],

  opponentCards: [
    {
      pokemonId: Number,
      name: String,
      image: String,
      hp: Number,
      attack: Number,
      defense: Number,
      power: Number,
      rarity: String,
    },
  ],

  // Résultat
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  loser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // Puissance totale de chaque côté (pour affichage)
  challengerPower: { type: Number, default: 0 },
  opponentPower: { type: Number, default: 0 },

  // Statut du combat
  status: {
    type: String,
    enum: ["pending", "accepted", "declined", "finished"],
    default: "pending",
  },

  createdAt: { type: Date, default: Date.now },
  finishedAt: { type: Date, default: null },
});

module.exports = mongoose.model("Battle", battleSchema);
