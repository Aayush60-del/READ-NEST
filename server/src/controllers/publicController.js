const User = require("../models/User");
const Book = require("../models/Book");
const ReadingProgress = require("../models/ReadingProgress");

const getPublicStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBooks,
      booksWithPublishedField,
      publishedBooksCount,
      pagesReadAgg,
      completedBooks,
      activeReaders,
      totalReadingSessions
    ] = await Promise.all([
      User.countDocuments({}),
      Book.countDocuments({}),
      Book.countDocuments({ isPublished: { $exists: true } }),
      Book.countDocuments({ isPublished: true }),
      ReadingProgress.aggregate([
        { $group: { _id: null, totalPagesRead: { $sum: { $ifNull: ["$currentPage", 0] } } } }
      ]),
      ReadingProgress.countDocuments({ isCompleted: true }),
      ReadingProgress.distinct("userId", {}),
      ReadingProgress.countDocuments({})
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBooks,
        publishedBooks: booksWithPublishedField > 0 ? publishedBooksCount : totalBooks,
        totalPagesRead: pagesReadAgg[0]?.totalPagesRead || 0,
        completedBooks,
        activeReaders: activeReaders.length,
        totalReadingSessions
      }
    });
  } catch (err) {
    console.error("[getPublicStats] Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching public stats",
      error: err.message
    });
  }
};

module.exports = { getPublicStats };
