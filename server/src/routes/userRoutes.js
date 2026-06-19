const express = require('express');
const router = express.Router();
const {protect, adminOnly} = require("../middleware/authMiddleware");
const { getProfile, getAllUsers, deleteUserById } = require("../controllers/userController");

router.use(express.json());

router.get("/profile" , protect , getProfile);
router.get("/all", protect, adminOnly, getAllUsers);
router.delete("/:id", protect, adminOnly, deleteUserById);

module.exports = router;