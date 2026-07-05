const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getAdminAnalytics } = require("../controllers/adminAnalyticsController");

const router = express.Router();

router.get("/analytics", protect, adminOnly, getAdminAnalytics);

module.exports = router;
