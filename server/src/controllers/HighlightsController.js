const BookModel = require("../models/Book");
const ReadingProgressModel = require("../models/ReadingProgress");
const BookMark = require("../models/BookMark");
const NoteModel = require("../models/Notes");
const HighlightsModel = require("../models/Highlight");

const AddHighlights = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookId = req.params.id;
        const { selectedText, color } = req.body;

        const progress = await ReadingProgressModel.findOne({
            userId,
            bookId
        });

        if (!progress) {
            return res.status(404).json({
                message: "Book not found in reading progress"
            });
        }

        const newHighlight = await HighlightsModel.create({
            userId,
            bookId,
            pageNumber: progress.currentPage,
            SelectedText: selectedText,
            color
        });

        res.status(200).json({
            message: "Highlight added successfully",
            data: newHighlight
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const GetHighlights = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookId = req.params.id;

        const highlights = await HighlightsModel.find({
            userId,
            bookId
        });

        if (!highlights || highlights.length === 0) {
            return res.status(404).json({
                message: "No highlights found"
            });
        }

        res.status(200).json({
            message: "Highlights fetched successfully",
            highlights
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const DeleteHighlight = async (req, res) => {
    try {
        const userId = req.user.id;
        const highlightId = req.params.id;

        const deleted = await HighlightsModel.findOneAndDelete({
            _id: highlightId,
            userId
        });

        if (!deleted) {
            return res.status(404).json({
                message: "Highlight not found"
            });
        }

        res.status(200).json({
            message: "Highlight deleted successfully"
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    AddHighlights,
    GetHighlights,
    DeleteHighlight
};