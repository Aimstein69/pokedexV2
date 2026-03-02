const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  // ── Identité ──────────────────────────────────────────
  username: {
    type: String,
    required: [true, "Le pseudo est obligatoire"],
    unique: true,
    trim: true,
    minlength: [3, "Le pseudo doit faire au moins 3 caractères"],
    maxlength: [20, "Le pseudo ne peut pas dépasser 20 caractères"],
  },

  email: {
    type: String,
    required: [true, "L'email est obligatoire"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Email invalide"],
  },

  password: {
    type: String,
    required: [true, "Le mot de passe est obligatoire"],
    minlength: [6, "Le mot de passe doit faire au moins 6 caractères"],
  },

  avatar: {
    type: String,
    default:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png", // Metamorph par défaut
  },

  // ── Inventaire ────────────────────────────────────────
  inventory: [
    {
      pokemonId: { type: Number, required: true }, // ID PokéAPI
      name: { type: String, required: true },
      image: { type: String },
      rarity: {
        type: String,
        enum: ["common", "rare", "epic", "legendary"],
        default: "common",
      },
      hp: { type: Number },
      attack: { type: Number },
      defense: { type: Number },
      types: [{ type: String }],
      obtainedAt: { type: Date, default: Date.now },
    },
  ],

  // ── Stats de jeu ──────────────────────────────────────
  stats: {
    battlesWon: { type: Number, default: 0 },
    battlesLost: { type: Number, default: 0 },
    totalCards: { type: Number, default: 0 },
    packsOpened: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
  },

  // ── Monnaie virtuelle ─────────────────────────────────
  coins: {
    type: Number,
    default: 500, // 500 pièces offertes à l'inscription
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ── Hash le mot de passe AVANT de sauvegarder ─────────
userSchema.pre("save", async function (next) {
  // Si le password n'a pas été modifié, on ne re-hash pas
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Méthode pour comparer les mots de passe ───────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Méthode pour recalculer le score ──────────────────
userSchema.methods.recalcScore = function () {
  this.stats.score =
    this.stats.totalCards * 10 +
    this.stats.battlesWon * 50 -
    this.stats.battlesLost * 10;
};

module.exports = mongoose.model("User", userSchema);
