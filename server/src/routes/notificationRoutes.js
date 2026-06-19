const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  registerToken,
  getNotifications,
  markAsRead,
  markAllAsRead,
  updateSettings
} = require("../controllers/notificationController");

router.post("/fcm-token", protect, registerToken);
router.get("/", protect, getNotifications);
router.put("/read-all", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);
router.put("/settings", protect, updateSettings);

module.exports = router;
