const jwt = require("jsonwebtoken");
const User = require("../models/User");
const fs = require("fs");

function logToFile(message) {
  fs.appendFileSync("debug.log", `[${new Date().toISOString()}] ${message}\n`);
}

const protect = async (req, res, next) => {
  try {
    logToFile(`🔐 Protect middleware: ${req.method} ${req.path}`);
    let token;

    // Le token arrive dans le header : Authorization: Bearer <token>
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      logToFile(`✅ Token found: ${token.substring(0, 20)}...`);
    }

    if (!token) {
      logToFile("❌ Token missing");
      return res.status(401).json({ message: "Non autorisé - Token manquant" });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logToFile(`🔓 Token decoded, user id: ${decoded.id}`);

    // Injecter l'utilisateur dans req (sans le password)
    req.user = await User.findById(decoded.id).select("-password");
    logToFile(`👤 User loaded: ${req.user ? req.user.username : 'NOT FOUND'}`);

    if (!req.user) {
      logToFile("❌ User not found in DB");
      return res.status(401).json({ message: "Utilisateur introuvable" });
    }

    next(); // Passer à la suite (le controller)
  } catch (error) {
    logToFile(`❌ Protect error: ${error.message}`);
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

module.exports = { protect };
