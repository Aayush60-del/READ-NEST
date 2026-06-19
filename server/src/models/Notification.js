const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["streak_warning", "streak_achievement", "reading_goal", "book_completed", "recommendation", "system"],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      default: "/",
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

const NotificationModel = mongoose.model("Notification", notificationSchema);
module.exports = NotificationModel;
