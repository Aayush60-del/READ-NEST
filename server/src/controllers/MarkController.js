const mongoose = require("mongoose");
const BookModel = require("../models/Book");
const ReadingProgressModel = require("../models/ReadingProgress");
const BookMark = require("../models/BookMark");
const ReadingSessionModel = require("../models/ReadingSession");



const BookMarker = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const bookId = req.params.id;
        const { pageNumber } = req.body;

        const book = await BookModel.findById(bookId);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        if (!pageNumber || pageNumber < 1) {
            return res.status(400).json({
                message: "Invalid page number"
            });
        }

        if (pageNumber > book.totalPages) {
            return res.status(400).json({
                message: "Page exceeds total pages"
            });
        }

        const existing = await BookMark.findOne({
            userId,
            bookId,
            pageNumber
        });

        if (existing) {
            return res.status(400).json({
                message: "Bookmark already exists on this page"
            });
        }

        const bookmark = await BookMark.create({
            userId,
            bookId,
            pageNumber
        });

        return res.status(201).json({
            message: "Bookmark created successfully",
            data: bookmark
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: "Server error while creating bookmark",
            error: err.message
        });
    }
};

const AllBookMarker = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const bookId = req.params.id;


        const book = await BookModel.findById(bookId);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }




        const bookmarks = await BookMark.find({
            userId,
            bookId
        }).sort({ pageNumber: 1 });

        if (!bookmarks.length) {
            return res.status(200).json({
                message: "No bookmarks found",
                data: []
            });
        }

        return res.status(200).json({
            message: "Bookmarks fetched successfully",
            data: bookmarks
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: "Server error while fetching bookmarks",
            error: err.message
        });
    }
};

const DelBookMarker = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { bookmarkId } = req.params;

        const bookmark = await BookMark.findOne({
            _id: bookmarkId,
            userId
        });



        if (!bookmark) {
            return res.status(404).json({
                message: "Bookmark not found"
            });
        }

        await BookMark.deleteOne({ _id: bookmarkId });

        return res.status(200).json({
            message: "Bookmark deleted successfully"
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: "Server error while deleting bookmark",
            error: err.message
        });
    }
};


const SearchBook = async (req, res) => {
    try {
        const title = req.query.title || req.params.title || "";

        const books = await BookModel.find({
            title:
            {
                $regex: title,
                $options: "i"
            }
        }).select("title author coverImage category");

        return res.status(200).json({
            message: "Books found",
            data: books
        })

    }
    catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}

const getLibBooks = async (req, res) => {
    try {
        const { category, search, sort = "newest" } = req.query;

        const filter = {};

        if (category && category !== "All") {
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { author: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } }
            ];
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;

        const skip = (page - 1) * limit;

        const sortMap = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            title: { title: 1 },
        };

        const books = await BookModel.find(filter).select(
            "title author category coverImage description totalPages createdAt updatedAt"
        ).sort(sortMap[sort] || sortMap.newest).skip(skip).limit(limit).lean();
        const totalBooks = await BookModel.countDocuments(filter);

        return res.status(200).json({
            totalBooks,
            page,
            limit,
            data: books
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}

const getReadingStats = async (req, res) => {
    try {

        const userId = req.user.id;

        const totalBooks = await ReadingProgressModel.countDocuments({
            userId
        })

        const CompletedBooks = await ReadingProgressModel.countDocuments({
            userId,
            isCompleted: true
        })

        const CurrentlyReading = await ReadingProgressModel.countDocuments({
            userId,
            isCompleted: false
        })

        const progressItems = await ReadingProgressModel.find({ userId }).select("currentPage").lean();
        const totalPagesRead = progressItems.reduce((sum, book) => sum + book.currentPage, 0);
        const sessionStats = await ReadingSessionModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalActiveSeconds: { $sum: { $ifNull: ["$activeSeconds", 0] } },
                    totalSessions: { $sum: 1 },
                    qualifiedSessions: {
                        $sum: { $cond: [{ $eq: ["$qualifiedForStreak", true] }, 1, 0] }
                    },
                    pagesTouchedNested: { $push: "$pagesVisited" }
                }
            }
        ]);

        const sessionSummary = sessionStats[0] || {};
        const pagesTouched = new Set(
            (sessionSummary.pagesTouchedNested || [])
                .flat()
                .filter((page) => Number.isFinite(Number(page)))
        ).size;
        const qualifiedDates = await ReadingSessionModel.find({
            userId,
            qualifiedForStreak: true
        }).select("sessionDate").sort({ sessionDate: 1 }).lean();

        const CompletionRate =
            totalBooks > 0
                ? Math.round((CompletedBooks / totalBooks) * 100)
                : 0;

        res.status(200).json({
            message: "Reading stats fetched successfully",
            data: {
                totalBooks,
                CompletedBooks,
                CurrentlyReading,
                totalPagesRead,
                CompletionRate,
                totalReadingSeconds: sessionSummary.totalActiveSeconds || 0,
                totalReadingMinutes: Math.round((sessionSummary.totalActiveSeconds || 0) / 60),
                totalSessions: sessionSummary.totalSessions || 0,
                qualifiedSessions: sessionSummary.qualifiedSessions || 0,
                pagesTouched,
                readingDays: qualifiedDates.map((session) => session.sessionDate)
            }
        });
    }
    catch (err) {

        res.status(500).json({
            message: err.message
        })
    }
}


module.exports = { BookMarker, AllBookMarker, DelBookMarker, SearchBook, getLibBooks, getReadingStats };
