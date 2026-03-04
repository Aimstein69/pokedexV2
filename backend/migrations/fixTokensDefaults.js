const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");

// ── Migration : Corriger les anciens tokens à 200 → 500
async function fixTokens() {
  try {
    await connectDB();
    console.log("📝 Correction des tokens en cours...");

    // 1️⃣ Mettre à jour les users avec 200 tokens → 500
    const result200 = await User.updateMany(
      { tokens: 200 },
      { tokens: 500 }
    );
    console.log(`✅ ${result200.modifiedCount} utilisateurs avec 200 tokens → 500`);

    // 2️⃣ Ajouter les tokens 500 aux users qui n'en ont pas
    const resultMissing = await User.updateMany(
      { tokens: { $exists: false } },
      {
        tokens: 500,
        dailyLoginStreak: 0,
        dailyLoginDay: 0,
        lastLoginDate: null,
      }
    );
    console.log(`✅ ${resultMissing.modifiedCount} utilisateurs sans tokens → 500`);

    // 3️⃣ Vérifier l'état final
    const users = await User.find({}).select("username email tokens");
    console.log("\n📋 État final des utilisateurs :");
    users.forEach(user => {
      console.log(`  - ${user.username}: ${user.tokens} tokens`);
    });

    console.log(`\n✨ Total utilisateurs: ${users.length}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur migration :", error);
    process.exit(1);
  }
}

fixTokens();
