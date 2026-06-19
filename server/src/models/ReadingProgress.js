const mongoose = require("mongoose");

const ReadingProgressSchema = new mongoose.Schema(
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

    currentPage: {
      type: Number,
      default: 0,
      min: 0,
    },

    percentageCompleted: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },
     totalPages: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

ReadingProgressSchema.index(
  { userId: 1, bookId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ReadingProgress",
  ReadingProgressSchema
);