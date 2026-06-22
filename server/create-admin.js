require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

// Local/admin setup utility only. Do not run this from application startup.
// Set ADMIN_EMAIL and ADMIN_PASSWORD in your local environment before running.
const ADMIN_NAME = process.env.ADMIN_NAME || "ReadNest Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

(async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is required to create an admin user.");
    }

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 11);

    const user = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
      },
      { upsert: true, new: true }
    );

    console.log("Admin ready:");
    console.log("Email:", ADMIN_EMAIL);
    console.log("Role:", user.role);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
