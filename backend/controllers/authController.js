const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ── Génère un token JWT ────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }, // Le token expire dans 7 jours
  );
};

// ══════════════════════════════════════════════════════
// POST /api/auth/register
// ══════════════════════════════════════════════════════
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérification que tous les champs sont présents
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Tous les champs sont obligatoires" });
    }

    // Vérifier si l'email existe déjà
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Vérifier si le pseudo existe déjà
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Ce pseudo est déjà pris" });
    }

    // Créer l'utilisateur (le password sera hashé par le pre-save hook)
    const user = await User.create({ username, email, password });

    // Retourner le token + les infos publiques
    res.status(201).json({
      message: "Compte créé avec succès !",
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        tokens: user.tokens,
        stats: user.stats,
      },
    });
  } catch (error) {
    // Erreur de validation Mongoose (ex: champ trop court)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    console.error("Erreur register :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ══════════════════════════════════════════════════════
// POST /api/auth/login
// ══════════════════════════════════════════════════════
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email et mot de passe obligatoires" });
    }

    // Chercher l'utilisateur par email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Comparer le mot de passe avec le hash en DB
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // ── Vérifier la récompense quotidienne ──────────────
    const dailyReward = user.handleDailyLogin();
    await user.save();

    // Connexion réussie
    res.json({
      message: `Bienvenue ${user.username} !`,
      token: generateToken(user._id),
      dailyReward: dailyReward,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        tokens: user.tokens || 200,
        stats: user.stats,
        dailyLoginStreak: user.dailyLoginStreak,
        inventory: user.inventory,
      },
    });
  } catch (error) {
    console.error("Erreur login :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ══════════════════════════════════════════════════════
// GET /api/auth/me  (vérifier son token)
// ══════════════════════════════════════════════════════
const getMe = async (req, res) => {
  try {
    // req.user est injecté par le middleware protect
    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      tokens: user.tokens || 200,
      stats: user.stats,
      dailyLoginStreak: user.dailyLoginStreak,
      inventory: user.inventory,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { register, login, getMe };
