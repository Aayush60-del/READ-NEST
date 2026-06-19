require("dotenv").config();
const mongoose = require("mongoose");

const Book = require("./src/models/Book");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await Book.deleteMany({
      title: { $regex: "The Alchemist", $options: "i" }
    });

    console.log("Deleted books:", result.deletedCount);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
