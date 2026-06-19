const Notification = require("../models/Notification");
const User = require("../models/User");

// @desc    Register FCM Token
// @route   POST /api/notifications/fcm-token
// @access  Private
exports.registerToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "FCM Token is required" });

    // Use $addToSet to prevent duplicate tokens for the same user
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { fcmTokens: token }
    });

    res.status(200).json({ message: "FCM Token registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50

    const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { returnDocument: 'after' }
    );

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update notification settings
// @route   PUT /api/notifications/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const { enabled, dailyReminders, streakAchievements, bookCompletion } = req.body;
    
    const updateObj = {};
    if (enabled !== undefined) updateObj["notificationSettings.enabled"] = enabled;
    if (dailyReminders !== undefined) updateObj["notificationSettings.dailyReminders"] = dailyReminders;
    if (streakAchievements !== undefined) updateObj["notificationSettings.streakAchievements"] = streakAchievements;
    if (bookCompletion !== undefined) updateObj["notificationSettings.bookCompletion"] = bookCompletion;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateObj },
      { returnDocument: 'after' }
    ).select("-password -fcmTokens");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
