const multer = require("multer");

const storage = multer.memoryStorage();

// File validation filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "coverImage") {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Please upload only images for the cover."));
    }
  } else if (file.fieldname === "pdfFile") {
    if (file.mimetype !== "application/pdf" && file.mimetype !== "application/epub+zip") {
      return cb(new Error("Please upload only PDF or EPUB files for the book."));
    }
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max file size
  },
});

module.exports = upload;