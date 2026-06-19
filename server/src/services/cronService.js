const cron = require("node-cron");
const StreakModel = require("../models/ReadStreak");
const notificationService = require("./notificationService");

const MOTIVATIONAL_QUOTES = [
  "A reader lives a thousand lives.",
  "One page today is better than none.",
  "Consistency creates mastery.",
  "Small progress every day becomes success.",
  "Protect your streak today.",
];

const getRandomQuote = () => {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
};

const sendDailyReminders = async (timeOfDay) => {
  try {
    console.log(`[Cron] Running daily reading reminders for ${timeOfDay}...`);
    
    // Find streaks where lastReadDate is not today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const streaks = await StreakModel.find({}).populate("userId");

    let count = 0;
    for (const streakData of streaks) {
      if (!streakData.userId) continue;

      const lastRead = streakData.lastReadDate ? new Date(streakData.lastReadDate) : null;
      if (lastRead) lastRead.setHours(0, 0, 0, 0);

      // If user hasn't read today
      if (!lastRead || lastRead.getTime() !== todayTime) {
        
        let message = "";
        let title = "ReadNest Reminders";

        if (timeOfDay === "12PM") {
          title = "📚 Have you read today?";
          message = "Just 10 pages can make a difference. \n\n" + getRandomQuote();
        } else if (timeOfDay === "6PM") {
          title = "🔥 Your reading streak is at risk.";
          message = "Read for 10 minutes today to keep it alive. \n\n" + getRandomQuote();
        } else if (timeOfDay === "9PM") {
          title = "⏳ Last chance today.";
          message = "Don't break your streak now! \n\n" + getRandomQuote();
        }

        await notificationService.sendNotification({
          userId: streakData.userId._id,
          title,
          message,
          type: "streak_warning",
          url: "/library",
        });
        count++;
      }
    }
    console.log(`[Cron] Sent ${count} reminders for ${timeOfDay}.`);
  } catch (error) {
    console.error(`[Cron] Error sending daily reminders for ${timeOfDay}:`, error);
  }
};

exports.initCronJobs = () => {
  // 12 PM Reminder
  cron.schedule("0 12 * * *", () => {
    sendDailyReminders("12PM");
  });

  // 6 PM Reminder
  cron.schedule("0 18 * * *", () => {
    sendDailyReminders("6PM");
  });

  // 9 PM Reminder
  cron.schedule("0 21 * * *", () => {
    sendDailyReminders("9PM");
  });

  console.log("[Cron] Daily reading reminder jobs scheduled (12 PM, 6 PM, 9 PM).");
};
