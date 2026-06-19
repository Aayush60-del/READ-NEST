const mongoose = require("mongoose");

const BMarkSchema = new mongoose.Schema(
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
    pageNumber: {
      type: Number,
      required: true,
      min: 1,
    }
  },
  {
    timestamps: true,
  }
);

BMarkSchema.index({ userId: 1, bookId: 1 });

const BMarkModel = mongoose.model("BookMark", BMarkSchema);

module.exports = BMarkModel;