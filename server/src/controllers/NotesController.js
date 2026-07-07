const BookModel = require("../models/Book");
const ReadingProgressModel = require("../models/ReadingProgress");
const BookMark = require("../models/BookMark");
const NoteModel = require("../models/Notes");

const UploadNotes = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookId = req.params.id;
        const { note, pageNumber } = req.body;

        const bookCheck = await ReadingProgressModel.findOne({
            userId,
            bookId
        });

        if (!bookCheck) {
            return res.status(404).json({
                message: "Book not found in reading progress"
            });
        }

        const newNote = await NoteModel.create({
            userId,
            bookId,
            note,
            pageNumber: Math.max(1, Number(pageNumber) || bookCheck.currentPage || 1)
        });

        res.status(200).json({
            message: "Note added successfully",
            data: newNote
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const GetNotes = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookId = req.params.bookId;

        const notesData = await NoteModel.find({ userId, bookId }).lean();

        if (!notesData || notesData.length === 0) {
            return res.status(404).json({
                message: "No notes found"
            });
        }

        res.status(200).json({
            message: "Notes fetched successfully",
            notesData
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const UpdateNotes = async (req, res) => {
    try {
        const userId = req.user.id;
        const noteId = req.params.noteId || req.params.NotesId;
        const { note, pageNumber } = req.body;

        const update = { note };
        if (Number.isFinite(Number(pageNumber)) && Number(pageNumber) >= 1) {
            update.pageNumber = Math.floor(Number(pageNumber));
        }

        const updatedNote = await NoteModel.findOneAndUpdate(
            { _id: noteId, userId },
            update,
            { returnDocument: 'after' }
        );

        if (!updatedNote) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        res.status(200).json({
            message: "Note updated successfully",
            updatedNote
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const DeleteNotes = async (req, res) => {
    try {
        const userId = req.user.id;
        const noteId = req.params.noteId || req.params.NotesId || req.params.id;

        const deletedNote = await NoteModel.findOneAndDelete({
            _id: noteId,
            userId
        });

        if (!deletedNote) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        res.status(200).json({
            message: "Note deleted successfully"
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = {
    UploadNotes,
    GetNotes,
    UpdateNotes,
    DeleteNotes
};
