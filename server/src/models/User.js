const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },

    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    fcmTokens: {
      type: [String],
      default: [],
    },
    notificationSettings: {
      enabled: { type: Boolean, default: true },
      dailyReminders: { type: Boolean, default: true },
      streakAchievements: { type: Boolean, default: true },
      bookCompletion: { type: Boolean, default: true },
    }
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
