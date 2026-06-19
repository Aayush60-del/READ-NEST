const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("[WARNING] MONGO_URI not set. Skipping DB connection.");
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.warn("[WARNING] Error connecting to MongoDB", err.message);
    // Do not hard-exit; needed to surface startup warnings/deprecations.
  }
};

module.exports = connectDb;