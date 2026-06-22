const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const passport = require("./config/passport");



const requiredEnvVars = ["JWT_SECRET", "MONGO_URI"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`[WARNING] Missing critical environment variable: ${envVar}`);
  }
}

const app = express();

// Required when running behind Render proxy for rate limiting
app.set("trust proxy", 1);

// Security Middlewares
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Allow images/pdfs to be loaded cross-origin if needed

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// Serve local uploads fallback
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use(
    session({
        secret: "readnest",
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());
// Rate Limiting for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many login/signup attempts from this IP, please try again after 15 minutes."
});

// Routes
const authRoute = require("./routes/authRoutes");
const userRoute = require("./routes/userRoutes");
const bookRoute = require("./routes/bookRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { initCronJobs } = require("./services/cronService");

app.use("/auth", authLimiter, authRoute);
app.use("/user", userRoute);
app.use("/lib", bookRoute);
app.use("/api/notifications", notificationRoutes);

const { protect } = require("./middleware/authMiddleware");
const notificationService = require("./services/notificationService");

app.post("/api/test-notification", protect, async (req, res) => {
  try {
    await notificationService.sendNotification({
      userId: req.user.id,
      title: "ðŸ”¥ ReadNest",
      message: "Firebase notification system is working successfully.",
      type: "system",
      url: "/overview",
    });
    res.status(200).json({ message: "Test notification sent successfully" });
  } catch (error) {
    console.error("Test notification error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/get", (req, res) => {
  res.send("Welcome to Library");
});


// Initialize background jobs
initCronJobs();


app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ReadNest API is running",
    service: "readnest-backend"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "ReadNest backend is healthy"
  });
});

module.exports = app;






