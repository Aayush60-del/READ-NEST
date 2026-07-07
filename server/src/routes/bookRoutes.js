const express = require("express");
const Book = require("../models/Book");
const s3 = require("../config/s3");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const router = express.Router();


const streamToBufferForPdf = async (stream) => {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};


const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/authMiddleware");
const { createBook, getBooks, getBookById, updateBook, deleteBook, ReadingProgress, ContinueReading, getDiscoverRecommendations, getMyBooks, UserProgress, saveUserProgress, PdfRead, streamBookPdf } = require("../controllers/bookController");
const upload = require("../middleware/upload");
const { BookMarker, AllBookMarker, DelBookMarker, SearchBook, getLibBooks, getReadingStats } = require("../controllers/MarkController")

const { UploadNotes, GetNotes, UpdateNotes, DeleteNotes } = require("../controllers/NotesController")

const {AddHighlights,GetHighlights,DeleteHighlight} = require("../controllers/HighlightsController");
const { getStreak, markRead } = require("../controllers/streakController");

router.use(express.json());


router.post("/books", protect, adminOnly, upload.fields([{ name: "coverImage", maxCount: 1 },
{ name: "pdfFile", maxCount: 1 }
]), createBook);

router.get("/books/lib", protect, getBooks);

router.get("/books/:id", protect, getBookById);

router.put("/books/:id", protect, adminOnly, upload.fields([{ name: "coverImage", maxCount: 1 }, { name: "pdfFile", maxCount: 1 }]), updateBook);

router.delete("/books/:id", protect, adminOnly, deleteBook);

router.post("/reading-progress", protect, ReadingProgress);

router.get("/continue-reading", protect, ContinueReading);

router.get("/discover/recommendations", protect, getDiscoverRecommendations);

router.get("/myLibrary", protect, getMyBooks);

router.get("/books/:id/progress", protect, UserProgress)
router.post("/books/:id/progress", protect, saveUserProgress)

router.get("/books/:id/readBook", protect, PdfRead);
router.get("/books/:id/pdf-file", protect, streamBookPdf);

router.post("/books/:id/BookMarks", protect, BookMarker);
router.get("/books/:id/BookMarks", protect, AllBookMarker);
router.delete("/books/BookMarks/:bookmarkId", protect, DelBookMarker);

router.get("/books/search/:title", protect, SearchBook);

router.get("/books", protect, getLibBooks);

router.get("/reading-stats", protect, getReadingStats);

router.post("/books/:id/notes", protect, UploadNotes);
router.get("/books/:id/notes", protect, GetNotes);
router.put("/books/notes/:noteId", protect, UpdateNotes);
router.delete("/books/notes/:noteId", protect, DeleteNotes);
router.put("/books/:noteId", protect, UpdateNotes);
router.delete("/books/:id/notes", protect, DeleteNotes);

router.post("/books/:id/highlights", protect, AddHighlights);
router.get("/books/:id/highlights", protect, GetHighlights);
router.delete("/books/highlights/:id", protect, DeleteHighlight);










router.get("/streak", protect, getStreak);
router.post("/streak/mark", protect, markRead);


router.get("/books/:id/pdf-base64", protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const key = book.bookFileKey;

    if (!key) {
      return res.status(404).json({ message: "PDF key missing for this book" });
    }

    if (!s3) {
      return res.status(500).json({ message: "S3 is not configured" });
    }

    const result = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      })
    );

    const buffer = await streamToBufferForPdf(result.Body);

    if (!buffer || buffer.length === 0) {
      return res.status(500).json({ message: "Empty PDF file received from S3" });
    }

    const header = buffer.subarray(0, 5).toString("utf8");

    if (!header.startsWith("%PDF")) {
      return res.status(500).json({
        message: "S3 object is not a valid PDF",
        header,
      });
    }

    return res.json({
      mimeType: "application/pdf",
      byteLength: buffer.length,
      base64: buffer.toString("base64"),
    });
  } catch (err) {
    console.error("[pdf-base64] failed:", err);
    return res.status(500).json({
      message: "Failed to load PDF",
      error: err.message,
    });
  }
});


module.exports = router;
