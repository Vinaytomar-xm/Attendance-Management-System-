const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Verifies the JWT (read from the httpOnly cookie) and attaches the
// current user to req.user. Blocks the request if the token is missing,
// invalid, expired, or the user no longer exists / changed password since.
exports.protect = catchAsync(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return next(new AppError("You are not logged in. Please log in to continue.", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
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
