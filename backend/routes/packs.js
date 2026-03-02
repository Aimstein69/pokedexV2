const express = require("express");
const router = express.Router();
const { getPacks, openPack } = require("../controllers/packController");
const { protect } = require("../middleware/Auth");

router.get("/", getPacks); // GET /api/packs (public)
router.post("/open", protect, openPack); // POST /api/packs/open

module.exports = router;
