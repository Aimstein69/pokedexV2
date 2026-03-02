const mongoose = require("mongoose");

const packSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }, // En coins
  cardCount: { type: Number, default: 5 }, // Nombre de cartes par pack
  image: { type: String, default: "" },

  // Taux de rareté en pourcentage (doit totaliser 100)
  rarityRates: {
    common: { type: Number, default: 60 },
    rare: { type: Number, default: 25 },
    epic: { type: Number, default: 12 },
    legendary: { type: Number, default: 3 },
  },

  description: { type: String, default: "" },
});

module.exports = mongoose.model("Pack", packSchema);
