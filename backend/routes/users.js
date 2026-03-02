const express = require("express");
const router = express.Router();
const {
  getProfile,
  getInventory,
  getRanking,
  updateProfile,
  getUserById,
  claimDailyReward,
} = require("../controllers/userController");
const { protect } = require("../middleware/Auth");

router.get("/profile", protect, getProfile); // GET  /api/users/profile
router.get("/inventory", protect, getInventory); // GET  /api/users/inventory
router.post("/claim-daily-reward", protect, claimDailyReward); // POST /api/users/claim-daily-reward
router.get("/ranking", getRanking); // GET  /api/users/ranking  (public)
router.put("/profile", protect, updateProfile); // PUT  /api/users/profile
router.get("/:id", getUserById); // GET  /api/users/:id  (public) - DOIT ÊTRE DERNIER

module.exports = router;
