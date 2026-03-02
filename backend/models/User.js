const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Le pseudo est obligatoire"],
      unique: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Format d'email invalide",
      ],
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est obligatoire"],
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
    },
    // ── TOKENS ──────────────────────────────────────────
    tokens: {
      type: Number,
      default: 200,
    },
    // ── SYSTÈME DE DAILY LOGIN ──────────────────────────
    lastLoginDate: {
      type: Date,
      default: null,
    },
    dailyLoginStreak: {
      type: Number,
      default: 0,
    },
    dailyLoginDay: {
      type: Number,
      default: 0, // 0-6 (jour du cycle)
    },
    // ── STATISTIQUES ────────────────────────────────────
    stats: {
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
    },
    // ── INVENTAIRE ──────────────────────────────────────
    inventory: [
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

// Hash password avant de sauvegarder
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Méthode pour comparer les mots de passe
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Méthode pour gérer la récompense quotidienne ────────
userSchema.methods.handleDailyLogin = function () {
  const today = new Date().toDateString();
  const lastLogin = this.lastLoginDate ? new Date(this.lastLoginDate).toDateString() : null;

  // Si déjà connecté aujourd'hui, pas de récompense
  if (lastLogin === today) {
    return { rewarded: false, reason: "Déjà connecté aujourd'hui" };
  }

  // Incrémenter le jour du cycle (0-6)
  let day = (this.dailyLoginDay + 1) % 7;
  this.dailyLoginDay = day;
  this.lastLoginDate = new Date();

  let reward = { tokens: 0, packs: 0, message: "" };

  // Cycle de 7 jours :
  // Jour 0-3 : tokens (50 tokens/jour)
  // Jour 4-5 : packs (1 pack/jour)
  // Jour 6 : 1 pack + 50 tokens
  if (day <= 3) {
    reward.tokens = 50;
    reward.message = "✅ +50 tokens !";
  } else if (day <= 5) {
    reward.packs = 1;
    reward.message = "✅ +1 Pack !";
  } else {
    reward.tokens = 50;
    reward.packs = 1;
    reward.message = "✅ +1 Pack + 50 tokens !";
  }

  this.tokens += reward.tokens;
  this.dailyLoginStreak += 1;

  return {
    rewarded: true,
    ...reward,
    day: day + 1,
  };
};

module.exports = mongoose.model("User", userSchema);
