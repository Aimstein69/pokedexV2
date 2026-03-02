const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("../config/db");
const Card = require("../models/Card");

// Types des Pokémons
const POKEMON_TYPES = {
  1: "grass",
  4: "fire",
  7: "water",
  10: "bug",
  13: "bug",
  16: "flying",
  25: "electric",
  6: "fire",
  9: "water",
  3: "grass",
  24: "fire",
  35: "fairy",
  131: "water",
  149: "dragon",
  144: "ice",
  145: "electric",
  146: "fire",
  150: "psychic",
  151: "psychic",
};

async function fixCardTypes() {
  try {
    await connectDB();
    console.log("📝 Migration des types de cartes...");

    // Récupérer toutes les cartes
    const cards = await Card.find({});
    console.log(`📊 ${cards.length} cartes trouvées`);

    let updated = 0;

    // Mettre à jour chaque carte avec le bon type
    for (const card of cards) {
      const correctType = POKEMON_TYPES[card.pokemonId] || "normal";
      if (card.type !== correctType) {
        card.type = correctType;
        await card.save();
        updated++;
      }
    }

    console.log(`✅ ${updated} cartes corrigées`);
    console.log("📋 Cartes mises à jour:");

    // Afficher les cartes corrigées
    const updatedCards = await Card.find({}).select("pokemonName pokemonId type");
    updatedCards.slice(0, 10).forEach((card) => {
      console.log(
        `  - ${card.pokemonName} (ID: ${card.pokemonId}) -> Type: ${card.type}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur migration :", error);
    process.exit(1);
  }
}

fixCardTypes();
