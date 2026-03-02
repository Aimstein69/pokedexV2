require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

// ── Connexion MongoDB ─────────────────────────────────
connectDB();

// ── Middlewares globaux ───────────────────────────────
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use(express.json());

// ── Fichiers statiques ────────────────────────────────
app.use(express.static(path.join(__dirname, "..")));

// ── Logs pour debug ───────────────────────────────────
app.use((req, res, next) => {
  console.log(`📬 ${req.method} ${req.path}`);
  next();
});

// ── Import des routes (séparé pour Express 5) ─────────
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const packRoutes = require("./routes/packs");
const battleRoutes = require("./routes/battles");

// ── Montage des routes ────────────────────────────────
console.log("📌 Montage des routes...");
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/packs", packRoutes);
app.use("/api/battles", battleRoutes);

// ── Route de test ─────────────────────────────────────
app.get("/api", (req, res) => {
  res.json({
    message: "🚀 API Pokédex opérationnelle",
    version: "1.0.0",
    routes: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET  /api/auth/me",
      "GET  /api/users/profile",
      "GET  /api/users/inventory",
      "GET  /api/users/ranking",
      "GET  /api/packs",
      "POST /api/packs/open",
      "POST /api/battles",
      "POST /api/battles/:id/accept",
      "GET  /api/battles/pending",
      "GET  /api/battles/history",
    ],
  });
});

// ── Fallback → Login ──────────────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "..", "pages", "Login.html"));
});

// ── Démarrage ─────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
});
