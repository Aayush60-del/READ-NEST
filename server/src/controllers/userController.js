const User = require("../models/User");
const bcrypt = require("bcryptjs");
const ReadingProgress = require("../models/ReadingProgress");
const BookMark = require("../models/BookMark");
const Notes = require("../models/Notes");
const Highlights = require("../models/Highlight");
const Notification = require("../models/Notification");
const ReadStreak = require("../models/ReadStreak");

const getProfile = async (req, res) => {
    try {
        const { id } = req.user;

        if (!id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Profile fetched successfully",
            user
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const { name, email } = req.body;
        const normalizedEmail = String(email).trim().toLowerCase();

        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }

        // Check if email is taken by another user
        const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: id } });
        if (existing) {
            return res.status(400).json({ message: "Email is already in use by another account" });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { name: name.trim(), email: normalizedEmail },
            { returnDocument: 'after' }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { id } = req.user;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new passwords are required" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.password) {
            return res.status(400).json({ message: "This account uses OAuth. Password cannot be changed." });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect current password" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        user.password = await bcrypt.hash(newPassword, 11);
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const { id } = req.user;

        await Promise.all([
            ReadingProgress.deleteMany({ userId: id }),
            BookMark.deleteMany({ userId: id }),
            Notes.deleteMany({ userId: id }),
            Highlights.deleteMany({ userId: id }),
            Notification.deleteMany({ userId: id }),
            ReadStreak.deleteMany({ userId: id }),
        ]);

        await User.findByIdAndDelete(id);

        return res.status(200).json({ message: "Account and related data deleted successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        return res.status(200).json({ message: "Users fetched successfully", data: users });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (id === req.user.id) {
            return res.status(400).json({ message: "You cannot delete your own admin account from here." });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { getProfile, updateProfile, changePassword, deleteAccount, getAllUsers, deleteUserById };
