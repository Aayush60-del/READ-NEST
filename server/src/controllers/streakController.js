const StreakModel = require("../models/ReadStreak");
const notificationService = require("../services/notificationService");

/**
 * GET /lib/streak
 * Returns the current user's streak data including the last 7 days activity.
 */
const getStreak = async (req, res) => {
    try {
        const { id: userId } = req.user;

        let streakData = await StreakModel.findOne({ userId });

        if (!streakData) {
            return res.status(200).json({
                message: "No streak data found",
                data: {
                    streak: 0,
                    lastReadDate: null,
                    readDates: [],
                    last7Days: _getLast7Days([])
                }
            });
        }

        return res.status(200).json({
            message: "Streak retrieved successfully",
            data: {
                streak: streakData.streak,
                lastReadDate: streakData.lastReadDate,
                readDates: streakData.readDates,
                last7Days: _getLast7Days(streakData.readDates)
            }
        });
    } catch (err) {
        console.error("Error fetching streak:", err);
        return res.status(500).json({
            message: "Server error while fetching streak",
            error: err.message
        });
    }
};

/**
 * POST /lib/streak/mark
 * Marks today as a reading day and updates streak.
 * Auto-triggered when reading progress is saved.
 */
const markRead = async (req, res) => {
    try {
        const { id: userId } = req.user;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streakData = await StreakModel.findOne({ userId });

        if (!streakData) {
            streakData = new StreakModel({
                userId,
                streak: 1,
                lastReadDate: today,
                readDates: [today]
            });
            await streakData.save();
            return res.status(200).json({
                message: "Streak started! Day 1.",
                data: { streak: 1, lastReadDate: today }
            });
        }

        const lastRead = streakData.lastReadDate
            ? new Date(streakData.lastReadDate)
            : null;

        if (lastRead) {
            lastRead.setHours(0, 0, 0, 0);
        }

        const todayTime = today.getTime();
        const lastReadTime = lastRead ? lastRead.getTime() : 0;

        // Already marked today
        if (lastReadTime === todayTime) {
            return res.status(200).json({
                message: "Already marked today as read.",
                data: {
                    streak: streakData.streak,
                    lastReadDate: streakData.lastReadDate
                }
            });
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayTime = yesterday.getTime();

        let newStreak;
        if (lastReadTime === yesterdayTime) {
            // Consecutive day — increment streak
            newStreak = streakData.streak + 1;
        } else {
            // Streak broken — reset to 1
            newStreak = 1;
        }

        // Add today to readDates (avoid duplicates)
        const alreadyHasToday = streakData.readDates.some(d => {
            const dt = new Date(d);
            dt.setHours(0, 0, 0, 0);
            return dt.getTime() === todayTime;
        });

        const updatedReadDates = alreadyHasToday
            ? streakData.readDates
            : [...streakData.readDates, today];

        // Keep only last 60 days for efficiency
        const sixtyDaysAgo = new Date(today);
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const trimmedDates = updatedReadDates.filter(d => new Date(d) >= sixtyDaysAgo);

        streakData.streak = newStreak;
        streakData.lastReadDate = today;
        streakData.readDates = trimmedDates;

        await streakData.save();

        // Trigger Achievement Notification if milestone reached
        const milestones = [1, 3, 7, 14, 30, 60, 100];
        if (milestones.includes(newStreak)) {
            let message = "";
            if (newStreak === 1) message = "You've taken the first step. Great job!";
            else if (newStreak === 3) message = "Three days in a row! You're building a habit.";
            else if (newStreak === 7) message = "Amazing consistency. Keep reading every day.";
            else if (newStreak >= 30) message = "You are building a powerful reading habit.";
            else message = `You've read for ${newStreak} consecutive days!`;

            await notificationService.sendNotification({
                userId,
                title: `🔥 ${newStreak} Day Streak Unlocked`,
                message,
                type: "streak_achievement",
                url: "/stats"
            });
        }

        return res.status(200).json({
            message: `Streak updated to Day ${newStreak}!`,
            data: {
                streak: newStreak,
                lastReadDate: today,
                last7Days: _getLast7Days(trimmedDates)
            }
        });

    } catch (err) {
        console.error("Error marking read:", err);
        return res.status(500).json({
            message: "Server error while updating streak",
            error: err.message
        });
    }
};

/**
 * Helper: returns last 7 days with read status
 */
function _getLast7Days(readDates) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const readSet = new Set(
        readDates.map(d => {
            const dt = new Date(d);
            dt.setHours(0, 0, 0, 0);
            return dt.getTime();
        })
    );

    const days = [];
    for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);
        days.push({
            date: day.toISOString().split('T')[0],
            dayLabel: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()],
            isToday: i === 0,
            read: readSet.has(day.getTime())
        });
    }
    return days;
}

module.exports = { getStreak, markRead };
