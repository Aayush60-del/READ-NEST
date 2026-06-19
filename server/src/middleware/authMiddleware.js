const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Invalid token format"
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Server configuration error",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("_id role name email");

        if (!user) {
            return res.status(401).json({
                message: "Session user no longer exists. Please log in again.",
            });
        }

        req.user = {
            id: user._id.toString(),
            role: user.role,
            name: user.name,
            email: user.email,
        };

        next();
    }
    catch (err) {
        console.log("JWT ERROR:", err.message);

        return res.status(401).json({
            message: "Session expired or invalid. Please log in again.",
            error: err.message
        });
    }
};


const adminOnly = async (req, res, next) => {
    if(req.user?.role !== "admin") {
        return res.status(403).json({
            message: "Access denied. Admins only."
        });
    }
    next();
};

module.exports = {protect ,adminOnly};
