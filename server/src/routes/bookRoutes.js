const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/authMiddleware");
const { createBook, getBooks, getBookById, updateBook, deleteBook, ReadingProgress, ContinueReading, getMyBooks, UserProgress, saveUserProgress, PdfRead, streamBookPdf } = require("../controllers/bookController");
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
router.put("/books/:noteId", protect, UpdateNotes);
router.delete("/books/:id/notes", protect, DeleteNotes);

router.post("/books/:id/highlights", protect, AddHighlights);
router.get("/books/:id/highlights", protect, GetHighlights);
router.delete("/books/highlights/:id", protect, DeleteHighlight);










router.get("/streak", protect, getStreak);
router.post("/streak/mark", protect, markRead);

module.exports = router;
