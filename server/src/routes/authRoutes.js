const express = require("express");
const router = express.Router();
router.use(express.json());
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { login, signup } = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { getProfile, updateProfile, changePassword, deleteAccount } = require("../controllers/userController");

router.post("/login", login);
router.post("/signup", signup);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.delete("/account", protect, deleteAccount);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));


router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "/login"
    }),
    (req, res) => {
        try {
            const token = process.env.JWT_SECRET
                ? jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
                : null;

            if (!token) {
                return res.redirect(`${process.env.CLIENT_URL}/auth`);
            }

            return res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
        } catch (e) {
            return res.redirect(`${process.env.CLIENT_URL}/auth`);
        }
    }
);



router.get(
    "/github",
    passport.authenticate("github", {
        scope: ["user:email"]
    })
);

router.get(
    "/github/callback",
    passport.authenticate("github", {
        session: false,
        failureRedirect: "/login"
    }),
    (req, res) => {
        try {
            const token = process.env.JWT_SECRET
                ? jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
                : null;

            if (!token) {
                return res.redirect(`${process.env.CLIENT_URL}/auth`);
            }

            return res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
        } catch (e) {
            return res.redirect(`${process.env.CLIENT_URL}/auth`);
        }
    }
);


module.exports = router;