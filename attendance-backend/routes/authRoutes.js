const express = require("express");
const rateLimit = require("express-rate-limit");
const { register, login, logout, getMe } = require("../controllers/authController");
const { registerValidation, loginValidation } = require("../validations/authValidation");
const validateRequest = require("../middlewares/validateRequest");
const { protect, restrictTo } = require("../middlewares/auth");

const router = express.Router();

// Extra-strict limiter on login to slow down brute force / credential stuffing.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Only an already-logged-in admin can create more admins/teachers/students
// through this route in normal operation (see seed script for bootstrap admin).
router.post("/register", protect, restrictTo("admin"), registerValidation, validateRequest, register);
router.post("/login", loginLimiter, loginValidation, validateRequest, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

module.exports = router;
