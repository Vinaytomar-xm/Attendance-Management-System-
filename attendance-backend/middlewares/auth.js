const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Verifies the JWT — read from the httpOnly cookie when available, or
// from an "Authorization: Bearer <token>" header as a fallback. The header
// fallback exists because modern browsers (Chrome's third-party cookie
// restrictions) can silently block cross-site cookies between a Vercel
// frontend and a Render backend even when SameSite=None; Secure is set
// correctly — the header path is not affected by that restriction.
exports.protect = catchAsync(async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in. Please log in to continue.", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded token:", decoded); // Debugging line
  } catch (err) {
    return next(new AppError("Invalid or expired session. Please log in again.", 401));
  }

  const currentUser = await User.findById(decoded.id).select("+failedLoginAttempts +lockUntil");
  if (!currentUser || !currentUser.isActive) {
    return next(new AppError("This account no longer exists or is deactivated.", 401));
  }

  if (currentUser.passwordChangedAt) {
    const changedTimestamp = Math.floor(currentUser.passwordChangedAt.getTime() / 1000);
    if (decoded.iat < changedTimestamp) {
      return next(new AppError("Password was changed recently. Please log in again.", 401));
    }
  }

  req.user = currentUser;
  next();
});

// Usage: restrictTo("admin"), restrictTo("admin", "teacher")
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }
    next();
  };
};