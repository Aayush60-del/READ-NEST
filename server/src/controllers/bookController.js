const BookModel = require("../models/Book");
const ReadingProgressModel = require("../models/ReadingProgress");
const ReadingSessionModel = require("../models/ReadingSession");
const { uploadFileToS3, deleteFileFromS3, generateSignedUrl } = require("../services/s3Service");
const StreakModel = require("../models/ReadStreak");
const notificationService = require("../services/notificationService");
const s3 = require("../config/s3");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const BookMark = require("../models/BookMark");
const Notes = require("../models/Notes");
const Highlights = require("../models/Highlight");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeCategory = (category) => {
    if (Array.isArray(category)) {
        return category.map((item) => String(item).trim()).filter(Boolean);
    }

    return String(category || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const normalizeTotalPages = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.floor(parsed) : NaN;
};

const detectPdfPageCount = (file) => {
    if (!file || file.mimetype !== "application/pdf") return null;
    if (!file.buffer || file.buffer.length === 0) {
        throw new Error("PDF file is empty or could not be read");
    }

    const content = file.buffer.toString("latin1");
    const matches = content.match(/\/Type\s*\/Page\b(?!s)/g);
    const count = matches?.length || 0;

    if (count < 1) {
        throw new Error("Could not detect PDF page count. Please upload a valid PDF.");
    }

    return count;
};

const resolveTotalPagesForUpload = (file, manualTotalPages) => {
    const detectedPages = detectPdfPageCount(file);
    const normalizedManualPages = normalizeTotalPages(manualTotalPages);

    if (detectedPages) return detectedPages;

    if (!normalizedManualPages || normalizedManualPages < 1) {
        return null;
    }

    return normalizedManualPages;
};

const hasS3Config = Boolean(
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_NAME
);


const createBook = async (req, res) => {

    let coverResult, pdfResult;
    try {

        const { title, author, description, category, totalPages } = req.body;
        const normalizedCategory = normalizeCategory(category);
        const normalizedManualTotalPages = normalizeTotalPages(totalPages);

        if (!title || !author || !description || !normalizedCategory.length) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!req.files || !req.files.coverImage || !req.files.pdfFile) {
            return res.status(400).json({
                message: "Cover image and PDF file are required"
            });
        }


        const coverImage = req.files.coverImage[0];
        const pdfFile = req.files.pdfFile[0];
        const resolvedTotalPages = resolveTotalPagesForUpload(pdfFile, normalizedManualTotalPages);

        if (!resolvedTotalPages) {
            return res.status(400).json({
                message: "Could not detect page count. Provide total pages manually for non-PDF files."
            });
        }

        coverResult = await uploadFileToS3(coverImage, "cover");

        pdfResult = await uploadFileToS3(pdfFile, "books");



        const newBook = new BookModel({
            title,
            author,
            description,
            category: normalizedCategory,
            coverImage: coverResult.url,
            coverImageKey: coverResult.key,
            bookFileUrl: pdfResult.url,
            bookFileKey: pdfResult.key,
            uploadedBy: req.user.id,
            totalPages: resolvedTotalPages,

        });

        await newBook.save();
        res.status(201).json({
            message: "Book created successfully",
            data: newBook,
        });
    }
    catch (err) {
        if (coverResult?.key) {
            await deleteFileFromS3(coverResult.key);
        }

        if (pdfResult?.key) {
            await deleteFileFromS3(pdfResult.key);
        }
        console.error("Error creating book:", err);
        if (err.message?.includes("PDF") || err.message?.includes("page count")) {
            return res.status(400).json({
                message: err.message
            });
        }
        res.status(500).json({
            message: "Server error while creating book",
            error: err.message,
        });
    }


};

const getBooks = async (req, res) => {

    try {

        const Bookdata = await BookModel.find().lean();

        res.status(200).json({
            message: "Books retrieved successfully",
            data: Bookdata,
        });
    } catch (err) {
        console.error("Error retrieving books:", err);
        res.status(500).json({
            message: "Server error while retrieving books",
            error: err.message,
        });
    }
};

const getBookById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid book id"
            });
        }

        const Bookdata = await BookModel.findById(id);

        if (!Bookdata) {
            return res.status(404).json({
                message: "Book not found"
            });
        }
        res.status(200).json({
            message: "Book retrieved successfully",
            data: Bookdata,
        });
    } catch (err) {
        console.error("Error retrieving book:", err);
        res.status(500).json({
            message: "Server error while retrieving book",
            error: err.message,
        });
    }
};

const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = { ...req.body };

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid book id" });
        }

        if (updatedData.category !== undefined) {
            updatedData.category = normalizeCategory(updatedData.category);
            if (!updatedData.category.length) {
                return res.status(400).json({ message: "Category is required" });
            }
        }

        if (updatedData.totalPages !== undefined && updatedData.totalPages !== "") {
            updatedData.totalPages = normalizeTotalPages(updatedData.totalPages);
            if (!updatedData.totalPages || updatedData.totalPages < 1) {
                return res.status(400).json({ message: "Total pages must be at least 1" });
            }
        } else {
            delete updatedData.totalPages;
        }

        const existingBook = await BookModel.findById(id);
        if (!existingBook) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Process new cover image
        if (req.files && req.files.coverImage) {
            const coverImage = req.files.coverImage[0];
            const coverResult = await uploadFileToS3(coverImage, "cover");
            updatedData.coverImage = coverResult.url;
            updatedData.coverImageKey = coverResult.key;

            if (existingBook.coverImageKey) {
                deleteFileFromS3(existingBook.coverImageKey).catch(err => console.error("Failed to delete old cover", err));
            }
        }

        // Process new PDF
        if (req.files && req.files.pdfFile) {
            const pdfFile = req.files.pdfFile[0];
            const detectedOrFallbackTotalPages = resolveTotalPagesForUpload(
                pdfFile,
                updatedData.totalPages || existingBook.totalPages
            );

            if (!detectedOrFallbackTotalPages) {
                return res.status(400).json({
                    message: "Could not detect page count. Provide total pages manually for non-PDF files."
                });
            }

            const pdfResult = await uploadFileToS3(pdfFile, "books");
            updatedData.bookFileUrl = pdfResult.url;
            updatedData.bookFileKey = pdfResult.key;
            updatedData.totalPages = detectedOrFallbackTotalPages;

            if (existingBook.bookFileKey) {
                deleteFileFromS3(existingBook.bookFileKey).catch(err => console.error("Failed to delete old PDF", err));
            }
        }

        const updatedBook = await BookModel.findByIdAndUpdate(id, updatedData, { returnDocument: 'after' });

        res.status(200).json({
            message: "Book updated successfully",
            data: updatedBook,
        });
    } catch (err) {
        console.error("Error updating book:", err);
        if (err.message?.includes("PDF") || err.message?.includes("page count")) {
            return res.status(400).json({
                message: err.message
            });
        }
        res.status(500).json({
            message: "Server error while updating book",
            error: err.message,
        });
    }
};

const deleteBook = async (req, res) => {

    try {

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid book id"
            });
        }

        const deletedBook = await BookModel.findByIdAndDelete(id);

        if (!deletedBook) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        if (deletedBook.coverImage) {
            await deleteFileFromS3(deletedBook.coverImageKey);
        }
        if (deletedBook.bookFileUrl) {
            await deleteFileFromS3(deletedBook.bookFileKey);
        }

        await Promise.all([
            ReadingProgressModel.deleteMany({ bookId: id }),
            BookMark.deleteMany({ bookId: id }),
            Notes.deleteMany({ bookId: id }),
            Highlights.deleteMany({ bookId: id }),
        ]);

        res.status(200).json({
            message: "Book deleted successfully",
        });
    } catch (err) {
        console.error("Error deleting book:", err);
        res.status(500).json({
            message: "Server error while deleting book",
            error: err.message,
        });
    }

};

const ReadingProgress = async (req, res) => {

    try {
        const { id: userId } = req.user;
        const { bookId, currentPage } = req.body;

        const book = await BookModel.findById(bookId);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        const normalizedPage = Math.min(Math.max(Number(currentPage) || 0, 0), book.totalPages);
        const percentageCompleted = Math.round((normalizedPage / book.totalPages) * 100);

        const progress = await ReadingProgressModel.findOneAndUpdate(
            { userId, bookId },
            {
                $set: {
                    currentPage: normalizedPage,
                    percentageCompleted,
                    isCompleted: normalizedPage >= book.totalPages,
                    totalPages: book.totalPages,
                }
            },
            {
                upsert: true,
                returnDocument: 'after',
                setDefaultsOnInsert: true
            }
        );
        res.status(200).json({
            message: "Reading progress updated successfully",
            data: progress
        });
    }
    catch (err) {
        console.error("Error updating reading progress:", err);
        res.status(500).json({
            message: "Server error while updating reading progress",
            error: err.message,
        });
    }
}

const ContinueReading = async (req, res) => {
    try {
        const { id } = req.user;

        const progressData = await ReadingProgressModel
            .find({
                userId: id,
                isCompleted: false
            })
            .populate("bookId", "title author coverImage totalPages category createdAt updatedAt");

        if (!progressData.length) {
            return res.status(200).json({
                message: "No books available for continue reading",
                data: []
            });
        }

        const continueReadingData = progressData
            .filter(prog => prog.bookId)
            .map((prog) => ({
                bookId: prog.bookId._id,
                title: prog.bookId.title,
                currentPage: prog.currentPage,
                author: prog.bookId.author,
                totalPages: prog.bookId.totalPages,
                category: prog.bookId.category || [],
                percentageCompleted: prog.percentageCompleted,
                coverImage: prog.bookId.coverImage,
                updatedAt: prog.updatedAt,
                createdAt: prog.createdAt
            }));

        return res.status(200).json({
            message: "Continue reading data retrieved successfully",
            data: continueReadingData
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Server error while fetching continue reading",
            error: err.message
        });
    }
};

const toDiscoverBook = (book, extra = {}) => {
    if (!book) return null;

    const id = book._id || book.id;
    return {
        _id: id,
        bookId: id,
        title: book.title,
        author: book.author,
        description: book.description,
        category: book.category || [],
        totalPages: book.totalPages,
        coverImage: book.coverImage,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
        ...extra,
    };
};

const getDiscoverRecommendations = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const progressData = await ReadingProgressModel
            .find({ userId })
            .sort({ updatedAt: -1 })
            .populate("bookId", "title author description category coverImage totalPages createdAt updatedAt")
            .lean();

        const validProgress = progressData.filter((entry) => entry.bookId);
        const startedBookIds = validProgress.map((entry) => entry.bookId._id);
        const completedBookIds = validProgress
            .filter((entry) => entry.isCompleted)
            .map((entry) => entry.bookId._id);

        const continueReading = validProgress
            .filter((entry) => !entry.isCompleted && (entry.currentPage || 0) > 0)
            .slice(0, 10)
            .map((entry) => toDiscoverBook(entry.bookId, {
                currentPage: entry.currentPage,
                percentageCompleted: entry.percentageCompleted,
                isCompleted: entry.isCompleted,
                progressUpdatedAt: entry.updatedAt,
            }));

        const unfinishedBooks = validProgress
            .filter((entry) => !entry.isCompleted)
            .slice(0, 12)
            .map((entry) => toDiscoverBook(entry.bookId, {
                currentPage: entry.currentPage,
                percentageCompleted: entry.percentageCompleted,
                isCompleted: entry.isCompleted,
                progressUpdatedAt: entry.updatedAt,
            }));

        const categoryCounts = new Map();
        validProgress.forEach((entry) => {
            (entry.bookId.category || []).forEach((category) => {
                const key = String(category || "").trim();
                if (key) categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1);
            });
        });
        const preferredCategories = Array.from(categoryCounts.entries())
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .map(([category]) => category)
            .slice(0, 5);

        const similarGenreBooks = preferredCategories.length
            ? await BookModel.find({
                category: { $in: preferredCategories },
                _id: { $nin: startedBookIds },
            })
                .select("title author description category coverImage totalPages createdAt updatedAt")
                .sort({ createdAt: -1 })
                .limit(12)
                .lean()
            : [];

        const shortReadBooks = await BookModel.find({
            totalPages: { $lte: 180 },
            _id: { $nin: completedBookIds },
        })
            .select("title author description category coverImage totalPages createdAt updatedAt")
            .sort({ totalPages: 1, createdAt: -1 })
            .limit(12)
            .lean();

        const trendingProgress = await ReadingProgressModel.aggregate([
            {
                $group: {
                    _id: "$bookId",
                    readerCount: { $sum: 1 },
                    avgProgress: { $avg: "$percentageCompleted" },
                    lastOpenedAt: { $max: "$updatedAt" },
                }
            },
            { $sort: { readerCount: -1, avgProgress: -1, lastOpenedAt: -1 } },
            { $limit: 12 }
        ]);

        const trendingIds = trendingProgress.map((item) => item._id);
        const trendingBooks = trendingIds.length
            ? await BookModel.find({ _id: { $in: trendingIds } })
                .select("title author description category coverImage totalPages createdAt updatedAt")
                .lean()
            : [];
        const trendingBookMap = new Map(trendingBooks.map((book) => [String(book._id), book]));
        const trendingInLibrary = trendingProgress
            .map((item) => {
                const book = trendingBookMap.get(String(item._id));
                return toDiscoverBook(book, {
                    readerCount: item.readerCount,
                    averageProgress: Math.round(item.avgProgress || 0),
                    lastOpenedAt: item.lastOpenedAt,
                });
            })
            .filter(Boolean);

        const fallbackTrending = trendingInLibrary.length
            ? []
            : await BookModel.find()
                .select("title author description category coverImage totalPages createdAt updatedAt")
                .sort({ createdAt: -1 })
                .limit(12)
                .lean();

        const sessionSummary = await ReadingSessionModel.aggregate([
            { $match: { userId: userObjectId } },
            {
                $group: {
                    _id: "$bookId",
                    sessions: { $sum: 1 },
                    activeSeconds: { $sum: { $ifNull: ["$activeSeconds", 0] } },
                    lastSessionAt: { $max: "$endedAt" },
                }
            }
        ]);

        return res.status(200).json({
            message: "Discover recommendations fetched successfully",
            data: {
                continueReading,
                similarGenres: similarGenreBooks.map((book) => toDiscoverBook(book, {
                    recommendationReason: preferredCategories.length
                        ? `Because you read ${preferredCategories.slice(0, 2).join(", ")}`
                        : "Based on your library",
                })),
                shortReads: shortReadBooks.map((book) => toDiscoverBook(book, {
                    recommendationReason: `${book.totalPages} pages`,
                })),
                unfinishedBooks,
                trendingInLibrary: trendingInLibrary.length
                    ? trendingInLibrary
                    : fallbackTrending.map((book) => toDiscoverBook(book, {
                        readerCount: 0,
                        averageProgress: 0,
                    })),
                meta: {
                    preferredCategories,
                    startedBooks: startedBookIds.length,
                    readingSessions: sessionSummary.reduce((sum, item) => sum + item.sessions, 0),
                    activeSeconds: sessionSummary.reduce((sum, item) => sum + item.activeSeconds, 0),
                }
            }
        });
    } catch (err) {
        console.error("Error fetching discover recommendations:", err);
        return res.status(500).json({
            message: "Server error while fetching discover recommendations",
            error: err.message,
        });
    }
};

const getMyBooks = async (req, res) => {
    try {
        const { id } = req.user;
        const myBooks = await ReadingProgressModel.find({ userId: id }).sort({ updatedAt: -1 }).populate("bookId", "title author category coverImage totalPages createdAt updatedAt");

        if (myBooks.length === 0) {
            return res.status(200).json({
                message: "No books found in your library",
                data: []
            });
        }

        const booksData = myBooks
            .filter(entry => entry.bookId)
            .map((entry) => ({
                bookId: entry.bookId._id,
                title: entry.bookId.title,
                author: entry.bookId.author,
                category: entry.bookId.category || [],
                totalPages: entry.bookId.totalPages || entry.totalPages,
                isCompleted: entry.isCompleted,
                currentPage: entry.currentPage,
                percentageCompleted: entry.percentageCompleted,
                coverImage: entry.bookId.coverImage,
                updatedAt: entry.updatedAt,
                createdAt: entry.createdAt
            }));


        res.status(200).json({
            message: "User's books retrieved successfully",
            data: booksData
        });

    } catch (err) {
        {
            console.error(err);
            res.status(500).json({
                message: "Server error while fetching user's books",
                error: err.message
            });
        }

    }
};

const UserProgress = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const bookId = req.params.id;

        if (!isValidObjectId(bookId)) {
            return res.status(400).json({
                message: "Invalid book id"
            });
        }

        const progressData = await ReadingProgressModel
            .findOne({
                userId,
                bookId
            })
            .populate("bookId", "title author coverImage totalPages");

        if (!progressData || !progressData.bookId) {
            // Return 200 with null data so the reader can show a clean "no progress yet" state
            return res.status(200).json({
                message: "No progress yet",
                data: null
            });
        }

        res.status(200).json({
            message: "Request fulfilled",
            data: {
                bookId: progressData.bookId._id,
                title: progressData.bookId.title,
                author: progressData.bookId.author,
                coverImage: progressData.bookId.coverImage,
                totalPages: progressData.bookId.totalPages,
                currentPage: progressData.currentPage,
                percentageCompleted: progressData.percentageCompleted,
                isCompleted: progressData.isCompleted
            }
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Server error while fetching user progress",
            error: err.message
        });
    }
};


const MIN_SECONDS_TO_COUNT_READING_DAY = 5 * 60;

const getStartOfDay = (date = new Date()) => {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    return day;
};

const updateReadingStreakForQualifiedDay = async (userId, qualifiedDate) => {
    const today = getStartOfDay(qualifiedDate);
    let streak = await StreakModel.findOne({ userId });

    if (!streak) {
        streak = await StreakModel.create({
            userId,
            streak: 1,
            lastReadDate: today,
            readDates: [today]
        });
        return { streak, updated: true };
    }

    const alreadyHasToday = streak.readDates.some(d => {
        const dt = getStartOfDay(d);
        return dt.getTime() === today.getTime();
    });

    const lastRead = streak.lastReadDate ? getStartOfDay(streak.lastReadDate) : null;
    if (alreadyHasToday || (lastRead && lastRead.getTime() === today.getTime())) {
        return { streak, updated: false };
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    streak.streak = lastRead && lastRead.getTime() === yesterday.getTime()
        ? streak.streak + 1
        : 1;
    streak.lastReadDate = today;
    streak.readDates.push(today);

    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    streak.readDates = streak.readDates.filter(d => new Date(d) >= sixtyDaysAgo);

    await streak.save();
    return { streak, updated: true };
};

const saveUserProgress = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const bookId = req.params.id;
        const {
            currentPage,
            totalPages,
            sessionPagesRead = 0,
            sessionReadingSeconds = 0,
            readingSessionId,
            pagesVisited = []
        } = req.body;
        const normalizedSessionPagesRead = Math.max(0, Number(sessionPagesRead) || 0);
        const normalizedSessionReadingSeconds = Math.max(0, Number(sessionReadingSeconds) || 0);

        if (!isValidObjectId(bookId)) {
            return res.status(400).json({
                message: "Invalid book id"
            });
        }

        const book = await BookModel.findById(bookId);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        // Fetch existing progress BEFORE updating so we can detect first completion
        const existingProgress = await ReadingProgressModel.findOne({ userId, bookId });

        if (!Number.isFinite(Number(currentPage))) {
            return res.status(400).json({
                message: "Current page must be a valid number"
            });
        }

        const clientTotalPages = Number(totalPages);
        const safeTotalPages = Math.max(
            1,
            Number.isFinite(clientTotalPages) ? Math.floor(clientTotalPages) : 0,
            Number(book.totalPages) || 0,
            Number(existingProgress?.totalPages) || 0
        );
        const normalizedPage = Math.min(Math.max(Number(currentPage) || 0, 0), safeTotalPages);

        const percentageCompleted = Math.round(
            (normalizedPage / safeTotalPages) * 100
        );

        const isCompleted =
            normalizedPage >= safeTotalPages;

        const now = new Date();
        const sessionDate = getStartOfDay(now);
        const clientSessionId = String(readingSessionId || `${bookId}:${sessionDate.toISOString()}`);
        const normalizedPagesVisited = Array.from(
            new Set(
                (Array.isArray(pagesVisited) ? pagesVisited : [])
                    .map((page) => Number(page))
                    .filter((page) => Number.isFinite(page) && page >= 1 && page <= safeTotalPages)
                    .map((page) => Math.floor(page))
            )
        );

        if (normalizedPage >= 1 && !normalizedPagesVisited.includes(normalizedPage)) {
            normalizedPagesVisited.push(normalizedPage);
        }

        const existingSession = await ReadingSessionModel.findOne({
            userId,
            bookId,
            clientSessionId,
        });

        const previousQualifiedForStreak = Boolean(existingSession?.qualifiedForStreak);
        const nextActiveSeconds = Math.max(
            Number(existingSession?.activeSeconds) || 0,
            normalizedSessionReadingSeconds
        );
        const nextPagesVisited = Array.from(
            new Set([
                ...(existingSession?.pagesVisited || []),
                ...normalizedPagesVisited,
            ])
        ).sort((a, b) => a - b);
        const shouldCountReadingDay = nextActiveSeconds >= MIN_SECONDS_TO_COUNT_READING_DAY;

        await ReadingProgressModel.findOneAndUpdate(
            {
                userId,
                bookId
            },
            {
                $set: {
                    currentPage: normalizedPage,
                    percentageCompleted,
                    isCompleted,
                    totalPages: safeTotalPages
                }
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        const readingSession = await ReadingSessionModel.findOneAndUpdate(
            { userId, bookId, clientSessionId },
            {
                $setOnInsert: {
                    userId,
                    bookId,
                    clientSessionId,
                    sessionDate,
                    startedAt: now,
                },
                $set: {
                    endedAt: now,
                    activeSeconds: nextActiveSeconds,
                    pagesVisited: nextPagesVisited,
                    qualifiedForStreak: shouldCountReadingDay,
                },
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        if (
            Number.isFinite(clientTotalPages) &&
            clientTotalPages >= 1 &&
            Math.floor(clientTotalPages) !== Number(book.totalPages)
        ) {
            await BookModel.updateOne(
                { _id: bookId },
                { $set: { totalPages: Math.floor(clientTotalPages) } }
            );
        }

        // Send Book Completion Notification only on the FIRST time it becomes completed
        if (isCompleted && (!existingProgress || !existingProgress.isCompleted)) {
            await notificationService.sendNotification({
                userId,
                title: "Book Completed",
                message: `Congratulations! You finished reading ${book.title}.`,
                type: "book_completed",
                url: `/books/${bookId}`
            });
        }

        // Only qualified server-side reading sessions count as a reading day.
        if (shouldCountReadingDay && !previousQualifiedForStreak) {
            try {
                const { streak, updated } = await updateReadingStreakForQualifiedDay(userId, sessionDate);

                const milestones = [1, 3, 7, 14, 30, 60, 100];
                if (updated && milestones.includes(streak.streak)) {
                    let msg = "";
                    if (streak.streak === 1) msg = "You've taken the first step. Great job!";
                    else if (streak.streak === 3) msg = "Three days in a row! You're building a habit.";
                    else if (streak.streak === 7) msg = "Amazing consistency. Keep reading every day.";
                    else if (streak.streak >= 30) msg = "You are building a powerful reading habit.";
                    else msg = `You've read for ${streak.streak} consecutive days!`;

                    await notificationService.sendNotification({
                        userId,
                        title: `${streak.streak} Day Streak Unlocked`,
                        message: msg,
                        type: "streak_achievement",
                        url: "/stats"
                    });
                }
            } catch (streakErr) {
                // Non-blocking - streak failure shouldn't break progress save
                console.error("Streak update failed:", streakErr.message);
            }
        }

        return res.status(200).json({
            message: "Progress updated successfully",
            progressSaved: true,
            readingDayCounted: shouldCountReadingDay,
            sessionPagesRead: normalizedSessionPagesRead,
            sessionReadingSeconds: normalizedSessionReadingSeconds,
            readingSessionId: readingSession._id,
            data: {
                currentPage: normalizedPage,
                percentageCompleted,
                isCompleted,
                progressSaved: true,
                readingDayCounted: shouldCountReadingDay,
                sessionPagesRead: normalizedSessionPagesRead,
                sessionReadingSeconds: normalizedSessionReadingSeconds,
                sessionActiveSeconds: readingSession.activeSeconds,
                sessionPagesVisited: readingSession.pagesVisited.length,
                qualifiedForStreak: readingSession.qualifiedForStreak
            }
        });


    }
    catch (err) {
        console.error("[saveUserProgress] Error:", err);

        res.status(500).json({
            message: "Server error while saving user progress",
            error: err.message
        });

    }
}

const PdfRead = async (req, res) => {
    try {
        const bookId = req.params.id;
        if (!isValidObjectId(bookId)) {
            return res.status(400).json({ message: "Invalid book id" });
        }
        const bookData = await BookModel.findById(bookId);

        if (!bookData) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (!bookData.bookFileUrl && !bookData.bookFileKey) {
            return res.status(404).json({ message: "PDF file not found for this book" });
        }

        return res.status(200).json({
            message: "PDF proxy URL generated successfully",
            url: `/lib/books/${bookId}/pdf-file`
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: err.message });
    }
}

const getPdfKeyFromBook = (bookData) => {
    if (bookData.bookFileKey) return bookData.bookFileKey;

    if (!bookData.bookFileUrl) return "";

    try {
        const parsedUrl = new URL(bookData.bookFileUrl);
        const uploadsIndex = parsedUrl.pathname.indexOf("/uploads/");
        if (uploadsIndex !== -1) {
            return decodeURIComponent(parsedUrl.pathname.slice(uploadsIndex + "/uploads/".length));
        }
        return decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));
    } catch {
        const match = String(bookData.bookFileUrl).match(/uploads[\\/](.+)$/);
        return match ? match[1].replace(/\\/g, "/") : "";
    }
};

const streamBookPdf = async (req, res) => {
    try {
        const bookId = req.params.id;
        if (!isValidObjectId(bookId)) {
            return res.status(400).json({ message: "Invalid book id" });
        }
        const bookData = await BookModel.findById(bookId);

        if (!bookData) {
            return res.status(404).json({ message: "Book not found" });
        }

        const key = getPdfKeyFromBook(bookData);

        const filename = String(bookData.title || "book").replace(/[^\w .-]/g, "").trim() || "book";

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${filename}.pdf"`);
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Accept-Ranges", "bytes");

        // Local upload fallback
        if (!hasS3Config) {
            const localPath = path.join(__dirname, "../../public/uploads", key);

            if (key && fs.existsSync(localPath)) {
                const stat = fs.statSync(localPath);
                const range = req.headers.range;

                if (range) {
                    const parts = range.replace(/bytes=/, "").split("-");
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;

                    if (Number.isNaN(start) || Number.isNaN(end) || start >= stat.size || end >= stat.size) {
                        res.setHeader("Content-Range", `bytes */${stat.size}`);
                        return res.status(416).end();
                    }

                    res.status(206);
                    res.setHeader("Content-Range", `bytes ${start}-${end}/${stat.size}`);
                    res.setHeader("Content-Length", String(end - start + 1));
                    return fs.createReadStream(localPath, { start, end }).pipe(res);
                }

                res.setHeader("Content-Length", String(stat.size));
                return fs.createReadStream(localPath).pipe(res);
            }

            return res.status(404).json({
                message: "Local PDF file not found. Re-upload this book PDF from admin panel."
            });
        }

        // S3 stream through backend, so browser does not need S3 CORS.
        if (!key) {
            return res.status(404).json({
                message: "PDF key missing. Re-upload this book PDF from admin panel."
            });
        }

        const range = req.headers.range;
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            ...(range ? { Range: range } : {}),
        });

        const s3Response = await s3.send(command);

        if (range && s3Response.ContentRange) {
            res.status(206);
            res.setHeader("Content-Range", s3Response.ContentRange);
        }

        if (s3Response.ContentLength) {
            res.setHeader("Content-Length", String(s3Response.ContentLength));
        }

        return s3Response.Body.pipe(res);
    } catch (err) {
        console.error("PDF stream error:", err);
        return res.status(500).json({
            message: "Failed to stream PDF",
            error: err.message
        });
    }
};

module.exports = {
    createBook,
    getBooks,
    getBookById,
    updateBook,
    deleteBook,
    ReadingProgress,
    ContinueReading,
    getDiscoverRecommendations,
    getMyBooks,
    UserProgress,
    saveUserProgress,
    PdfRead,
    streamBookPdf
};

