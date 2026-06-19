const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: [String],
      required: true,
    },

    coverImage: {
      type: String,
      required: true,
    },
    coverImageKey:
    {
      type: String,
      required: true,
    },
    bookFileUrl: {
      type: String,
      required: true,
    },

    bookFileKey:
    {
        type: String,
        required:true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPublished: {
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

module.exports = mongoose.model("Book", bookSchema);
