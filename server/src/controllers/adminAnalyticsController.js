const User = require("../models/User");
const Book = require("../models/Book");
const ReadingProgress = require("../models/ReadingProgress");

const toStartOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const toSevenDaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
};

const getAdminAnalytics = async (req, res) => {
  try {
    const today = toStartOfToday();
    const sevenDaysAgo = toSevenDaysAgo();

    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      activeReadersToday,
      activeReadersThisWeek,
      totalBooks,
      booksWithPublishedField,
      publishedBooksCount,
      totalLibraryItems,
      completedBooks,
      pagesReadAgg,
      topBooksAgg,
      recentUsers,
      recentProgress
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      ReadingProgress.distinct("userId", { updatedAt: { $gte: today } }),
      ReadingProgress.distinct("userId", { updatedAt: { $gte: sevenDaysAgo } }),
      Book.countDocuments({}),
      Book.countDocuments({ isPublished: { $exists: true } }),
      Book.countDocuments({ isPublished: true }),
      ReadingProgress.countDocuments({}),
      ReadingProgress.countDocuments({ isCompleted: true }),
      ReadingProgress.aggregate([
        { $group: { _id: null, totalPagesRead: { $sum: { $ifNull: ["$currentPage", 0] } } } }
      ]),
      ReadingProgress.aggregate([
        {
          $group: {
            _id: "$bookId",
            readers: { $sum: 1 },
            averageProgress: { $avg: { $ifNull: ["$percentageCompleted", 0] } },
            pagesRead: { $sum: { $ifNull: ["$currentPage", 0] } }
          }
        },
        { $sort: { readers: -1, averageProgress: -1, pagesRead: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "books",
            localField: "_id",
            foreignField: "_id",
            as: "book"
          }
        },
        { $unwind: { path: "$book", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            bookId: "$_id",
            title: { $ifNull: ["$book.title", "Deleted book"] },
            author: { $ifNull: ["$book.author", "Unknown author"] },
            coverImage: "$book.coverImage",
            readers: 1,
            averageProgress: { $round: ["$averageProgress", 0] },
            pagesRead: 1
          }
        }
      ]),
      User.find({}).select("name email role createdAt").sort({ createdAt: -1 }).limit(5).lean(),
      ReadingProgress.find({})
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate("userId", "name email")
        .populate("bookId", "title author coverImage")
        .lean()
    ]);

    const recentActivity = recentProgress.map((entry) => ({
      id: entry._id,
      user: entry.userId
        ? {
            id: entry.userId._id,
            name: entry.userId.name || "Unknown user",
            email: entry.userId.email || ""
          }
        : null,
      book: entry.bookId
        ? {
            id: entry.bookId._id,
            title: entry.bookId.title || "Untitled book",
            author: entry.bookId.author || "Unknown author",
            coverImage: entry.bookId.coverImage || ""
          }
        : null,
      currentPage: entry.currentPage || 0,
      percentageCompleted: entry.percentageCompleted || 0,
      isCompleted: Boolean(entry.isCompleted),
      updatedAt: entry.updatedAt
    }));

    return res.status(200).json({
      message: "Admin analytics fetched successfully",
      data: {
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        activeReadersToday: activeReadersToday.length,
        activeReadersThisWeek: activeReadersThisWeek.length,
        totalBooks,
        publishedBooks: booksWithPublishedField > 0 ? publishedBooksCount : totalBooks,
        totalLibraryItems,
        totalPagesRead: pagesReadAgg[0]?.totalPagesRead || 0,
        completedBooks,
        topBooks: topBooksAgg,
        recentUsers,
        recentActivity
      }
    });
  } catch (err) {
    console.error("[getAdminAnalytics] Error:", err);
    return res.status(500).json({
      message: "Server error while fetching admin analytics",
      error: err.message
    });
  }
};

module.exports = { getAdminAnalytics };
