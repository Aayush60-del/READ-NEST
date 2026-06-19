const { getMessaging } = require("firebase-admin/messaging");
const app = require("../config/firebase");
const Notification = require("../models/Notification");
const User = require("../models/User");

/**
 * Sends a push notification and saves it to the database.
 * @param {Object} params
 * @param {String} params.userId - The ID of the user receiving the notification
 * @param {String} params.title - Notification title
 * @param {String} params.message - Notification body/message
 * @param {String} params.type - Notification type enum
 * @param {String} [params.url] - Optional URL to open when clicked
 */
exports.sendNotification = async ({ userId, title, message, type, url = "/" }) => {
  try {
    // 1. Save in-app notification to DB
    const newNotification = await Notification.create({
      userId,
      title,
      message,
      type,
      url,
    });

    // 2. Fetch User to check settings and get FCM tokens
    const user = await User.findById(userId);
    if (!user) return newNotification;

    // 3. Check global notification setting
    if (user.notificationSettings && user.notificationSettings.enabled === false) {
      return newNotification; // User disabled all notifications
    }

    // Check specific settings based on type
    if (type === "streak_achievement" && user.notificationSettings?.streakAchievements === false) return newNotification;
    if (type === "streak_warning" && user.notificationSettings?.dailyReminders === false) return newNotification;
    if (type === "book_completed" && user.notificationSettings?.bookCompletion === false) return newNotification;

    // 4. Send Push Notification via FCM if Firebase is configured and user has registered tokens
    if (app && user.fcmTokens && user.fcmTokens.length > 0) {
      const messagePayload = {
        notification: {
          title,
          body: message,
        },
        data: {
          url,
          type,
        },
        tokens: user.fcmTokens,
      };

      const response = await getMessaging(app).sendEachForMulticast(messagePayload);
      
      // Cleanup invalid tokens (e.g. uninstalled app, expired token)
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const error = resp.error;
            if (
              error.code === "messaging/invalid-registration-token" ||
              error.code === "messaging/registration-token-not-registered"
            ) {
              failedTokens.push(user.fcmTokens[idx]);
            }
          }
        });

        if (failedTokens.length > 0) {
          await User.findByIdAndUpdate(userId, {
            $pull: { fcmTokens: { $in: failedTokens } }
          });
          console.log(`[FCM] Cleaned up ${failedTokens.length} invalid tokens for user ${userId}`);
        }
      }
    }

    return newNotification;
  } catch (error) {
    console.error("[NotificationService] Error sending notification:", error);
    throw error;
  }
};
