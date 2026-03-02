const express = require("express");
const router = express.Router();
const {
  createBattle,
  acceptBattle,
  declineBattle,
  getPendingBattles,
  getBattleHistory,
} = require("../controllers/battleController");
const { protect } = require("../middleware/Auth");

router.post("/", protect, createBattle); // POST /api/battles
router.post("/:id/accept", protect, acceptBattle); // POST /api/battles/:id/accept
router.post("/:id/decline", protect, declineBattle); // POST /api/battles/:id/decline
router.get("/pending", protect, getPendingBattles); // GET  /api/battles/pending
router.get("/history", protect, getBattleHistory); // GET  /api/battles/history

module.exports = router;
