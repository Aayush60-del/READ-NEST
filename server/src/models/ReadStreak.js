const mongoose = require("mongoose")

const StreakSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    streak: {
        type: Number,
        default: 0
    },
    lastReadDate: {
        type: Date,
        default: null
    },
    readDates: {
        type: [Date],
        default: []
    }
});

const StreakModel = mongoose.model("Streaks", StreakSchema);

module.exports = StreakModel;
