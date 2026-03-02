const User = require("../models/User");
const fs = require("fs");

// ── Helper pour logs dans fichier ─────────────────────
function logToFile(message) {
  fs.appendFileSync("debug.log", `[${new Date().toISOString()}] ${message}\n`);
}

// ══════════════════════════════════════════════════════
// GET /api/users/profile  — Son propre profil
// ══════════════════════════════════════════════════════
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });
    
    // Retourner explicitement tous les champs
    res.json({
      _id: user._id,
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      tokens: user.tokens ?? 200,
      stats: user.stats,
      dailyLoginStreak: user.dailyLoginStreak,
      dailyLoginDay: user.dailyLoginDay,
      inventory: user.inventory,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Erreur getProfile :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ══════════════════════════════════════════════════════
// GET /api/users/inventory  — Son inventaire de cartes
// ══════════════════════════════════════════════════════
const getInventory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("inventory username").populate("inventory");
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    res.json({
      username: user.username,
      inventory: user.inventory,
      total: user.inventory.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ══════════════════════════════════════════════════════
// GET /api/users/ranking  — Classement des dresseurs
// ══════════════════════════════════════════════════════
const getRanking = async (req, res) => {
  try {
    const users = await User.find({})
      .select("username avatar stats coins createdAt")
      .sort({ "stats.score": -1 }) // Tri par score décroissant
      .limit(50); // Top 50

    // Ajouter le rang à chaque joueur
    const ranking = users.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      username: user.username,
      avatar: user.avatar,
      score: user.stats.score,
      battlesWon: user.stats.battlesWon,
      battlesLost: user.stats.battlesLost,
      totalCards: user.stats.totalCards,
      coins: user.coins,
    }));

    res.json(ranking);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ══════════════════════════════════════════════════════
// PUT /api/users/profile  — Modifier son avatar
// ══════════════════════════════════════════════════════
const updateProfile = async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      message: "Profil mis à jour",
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ══════════════════════════════════════════════════════
// GET /api/users/:id  — Voir le profil d'un autre joueur
// ══════════════════════════════════════════════════════
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -email -inventory",
    ); // Ne pas exposer les données privées

    if (!user) return res.status(404).json({ message: "Joueur introuvable" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ══════════════════════════════════════════════════════
// POST /api/users/claim-daily-reward  — Réclamer la récompense
// ══════════════════════════════════════════════════════
const claimDailyReward = async (req, res) => {
  try {
    logToFile(`🔵 claimDailyReward called for user: ${req.user._id}`);
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      logToFile("❌ User not found");
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    logToFile(`📋 User found: ${user.username}`);
    logToFile(`📅 Last Login Date: ${user.lastLoginDate}`);
    logToFile(`🎯 Daily Login Streak: ${user.dailyLoginStreak}`);
    logToFile(`📊 Daily Login Day: ${user.dailyLoginDay}`);

    // Appeller la fonction de récompense quotidienne
    const dailyReward = user.handleDailyLogin();
    logToFile(`🎁 Daily Reward Result: ${JSON.stringify(dailyReward)}`);
    
    // Si déjà récompensé aujourd'hui
    if (!dailyReward.rewarded) {
      logToFile("⏳ Already rewarded today");
      return res.status(400).json({ 
        message: dailyReward.reason || "Récompense déjà reçue aujourd'hui" 
      });
    }

    await user.save();
    logToFile(`✅ User saved with tokens: ${user.tokens}`);

    res.json({
      message: dailyReward.message,
      reward: {
        tokens: dailyReward.tokens,
        packs: dailyReward.packs,
      },
      dailyLoginStreak: user.dailyLoginStreak,
      dailyLoginDay: user.dailyLoginDay,
      tokens: user.tokens,
    });
  } catch (error) {
    logToFile(`❌ Erreur claim daily reward: ${error.message}`);
    logToFile(`Stack: ${error.stack}`);
    res.status(500).json({ message: "Erreur serveur: " + error.message });
  }
};

module.exports = {
  getProfile,
  getInventory,
  getRanking,
  updateProfile,
  getUserById,
  claimDailyReward,
};
