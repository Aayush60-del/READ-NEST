const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
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
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

NoteSchema.index({ userId: 1, bookId: 1 });

const NotesModel = mongoose.model("Notes", NoteSchema);

module.exports = NotesModel;
