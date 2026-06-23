const mongoose = require("mongoose");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

const normalizeText = (value, maxLength = 5000) => {
  const normalized = String(value || "").trim();
  return normalized.slice(0, maxLength);
};

const parsePositiveInteger = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return NaN;
  }

  return Math.floor(parsed);
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  normalizeEmail,
  normalizeText,
  parsePositiveInteger,
};
