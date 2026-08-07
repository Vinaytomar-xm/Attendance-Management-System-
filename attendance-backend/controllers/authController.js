const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { generateToken, sendTokenCookie } = require("../utils/generateToken");

const MAX_FAILED_ATTEMPTS = 50;
const LOCK_TIME_MINUTES = 5;

// Only admins can create other admins/teachers day-to-day, but the very
// first admin account has to come from somewhere — see seed script.
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role, department, rollNo, semester } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError("An account with this email already exists.", 409));
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    department: role !== "admin" ? department : undefined,
    rollNo: role === "student" ? rollNo : undefined,
    semester: role === "student" ? semester : undefined,
  });

  const token = generateToken(user._id, user.role);
  sendTokenCookie(res, token);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +failedLoginAttempts +lockUntil");

  if (!user) {
    return next(new AppError("Incorrect email or password.", 401));
  }

  if (user.isLocked()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return next(
      new AppError(`Account temporarily locked due to multiple failed attempts. Try again in ${minutesLeft} minute(s).`, 423)
    );
  }

  if (!user.isActive) {
    return next(new AppError("This account has been deactivated. Contact the admin.", 403));
  }

  const isCorrect = await user.comparePassword(password);

  if (!isCorrect) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = Date.now() + LOCK_TIME_MINUTES * 60 * 1000;
    }
    await user.save({ validateBeforeSave: false });
    return next(new AppError("Incorrect email or password.", 401));
  }

  // Reset failed attempts on successful login
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id, user.role);
  sendTokenCookie(res, token);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      rollNo: user.rollNo,
      semester: user.semester,
    },
  });
});

exports.logout = catchAsync(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// Silent check used by the frontend on page load / refresh to know if the
// httpOnly cookie session is still valid, without exposing the token itself.
exports.getMe = catchAsync(async (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      rollNo: user.rollNo,
      semester: user.semester,
    },
  });
});
