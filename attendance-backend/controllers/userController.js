const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Generic helpers, reused by both Student and Teacher routes — the only
// difference between them is the fixed `role` filter each route applies.

exports.createUser = (role) =>
  catchAsync(async (req, res, next) => {
    const { name, email, password, department, rollNo, semester } = req.body;

    if (!name || !email || !password) {
      return next(new AppError("Name, email and password are required", 400));
    }

    const existing = await User.findOne({ email });
    if (existing) return next(new AppError("An account with this email already exists.", 409));

    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      rollNo: role === "student" ? rollNo : undefined,
      semester: role === "student" ? semester : undefined,
    });

    res.status(201).json({
      success: true,
      data: {
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

exports.getUsers = (role) =>
  catchAsync(async (req, res) => {
    const filter = { role };
    if (req.query.department) filter.department = req.query.department;
    if (req.query.semester) filter.semester = req.query.semester;

    const users = await User.find(filter).populate("department", "name code").sort("name");
    res.status(200).json({ success: true, count: users.length, data: users });
  });

exports.getUser = (role) =>
  catchAsync(async (req, res, next) => {
    const user = await User.findOne({ _id: req.params.id, role }).populate("department", "name code");
    if (!user) return next(new AppError(`${role} not found`, 404));
    res.status(200).json({ success: true, data: user });
  });

exports.updateUser = (role) =>
  catchAsync(async (req, res, next) => {
    // Password changes should go through a dedicated flow, not a generic update.
    const { password, ...safeUpdates } = req.body;

    const user = await User.findOneAndUpdate({ _id: req.params.id, role }, safeUpdates, {
      new: true,
      runValidators: true,
    });
    if (!user) return next(new AppError(`${role} not found`, 404));
    res.status(200).json({ success: true, data: user });
  });

exports.deleteUser = (role) =>
  catchAsync(async (req, res, next) => {
    const user = await User.findOneAndDelete({ _id: req.params.id, role });
    if (!user) return next(new AppError(`${role} not found`, 404));
    res.status(200).json({ success: true, message: `${role} deleted` });
  });
