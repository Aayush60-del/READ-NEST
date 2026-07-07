const mongoose = require("mongoose");

const ReadingSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    clientSessionId: {
      type: String,
      required: true,
      trim: true,
    },
    sessionDate: {
      type: Date,
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    activeSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    pagesVisited: {
      type: [Number],
      default: [],
    },
    qualifiedForStreak: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ReadingSessionSchema.index(
  { userId: 1, bookId: 1, clientSessionId: 1 },
  { unique: true }
);
ReadingSessionSchema.index({ userId: 1, sessionDate: -1 });
ReadingSessionSchema.index({ userId: 1, qualifiedForStreak: 1, sessionDate: -1 });

module.exports = mongoose.model("ReadingSession", ReadingSessionSchema);
