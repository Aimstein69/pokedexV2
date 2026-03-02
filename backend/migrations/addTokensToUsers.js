const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");

// ── Migration : Ajouter les tokens aux utilisateurs existants
async function migrateTokens() {
  try {
    await connectDB();
    console.log("📝 Migration en cours...");

    // Mettre à jour tous les utilisateurs sans tokens
    const result = await User.updateMany(
      { tokens: { $exists: false } },
      { 
        tokens: 200,
        dailyLoginStreak: 0,
        dailyLoginDay: 0,
        lastLoginDate: null
      }
    );

    console.log(`✅ ${result.modifiedCount} utilisateurs mis à jour`);
    console.log(`📊 Utilisateurs non modifiés: ${result.matchedCount - result.modifiedCount}`);

    // Vérifier les utilisateurs mis à jour
    const users = await User.find({}).select("username email tokens");
    console.log("\n📋 État des utilisateurs après migration :");
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email}): ${user.tokens} tokens`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur migration :", error);
    process.exit(1);
  }
}

migrateTokens();
