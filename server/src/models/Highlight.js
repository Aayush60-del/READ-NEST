const mongoose = require("mongoose");

const HighlightsSchema = new mongoose.Schema(
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
    },
    SelectedText: {
      type: String,
    },
   color: {
    type: String,
    default: "yellow",
    enum: ["yellow", "green", "blue", "pink"]
}
  },
  {
    timestamps: true,
  }
);

HighlightsSchema.index({ userId: 1, bookId: 1 });

const HighlightsModel = mongoose.model("Highlights", HighlightsSchema);

module.exports = HighlightsModel;