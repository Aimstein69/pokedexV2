const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  pokemonId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String },
  types: [{ type: String }],

  // Stats de combat
  hp: { type: Number, required: true },
  attack: { type: Number, required: true },
  defense: { type: Number, required: true },
  speed: { type: Number, default: 0 },

  // Rareté — détermine la probabilité d'apparition dans un pack
  rarity: {
    type: String,
    enum: ["common", "rare", "epic", "legendary"],
    default: "common",
  },

  // Puissance globale (calculée automatiquement)
  power: { type: Number, default: 0 },
});

// Calcul automatique de la puissance avant sauvegarde
cardSchema.pre("save", function (next) {
  this.power = this.hp + this.attack + this.defense + this.speed;
  next();
});

module.exports = mongoose.model("Card", cardSchema);
