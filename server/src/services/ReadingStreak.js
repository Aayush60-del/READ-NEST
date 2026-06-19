const StreakModel = require("../models/ReadStreak");
const User = require("../models/User");

const updateReadingStreak = async (userId) => {
    const user = await User.findById(userId);
    const today = new Date();
    const lastRead = user.lastReadDate;

    const todayDate = new Date(today.toDateString());
    const lastReadDate = lastRead ? new Date(lastRead.toDateString()) : null;

    if (!lastReadDate) {
        user.streak = 1;
    } 
    else {
        const diffTime = todayDate - lastReadDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            user.streak += 1;
        } 
        else if (diffDays === 0) {
            return user;
        } 
        else {
            user.streak = 1;
        }
    }

    user.lastReadDate = todayDate;
    await user.save();

    return user;
};

module.exports = updateReadingStreak;
