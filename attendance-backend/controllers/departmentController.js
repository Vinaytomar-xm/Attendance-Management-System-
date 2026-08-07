const Department = require("../models/Department");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.createDepartment = catchAsync(async (req, res, next) => {
  const { name, code } = req.body;
  if (!name || !code) return next(new AppError("Name and code are required", 400));

  const department = await Department.create({ name, code });
  res.status(201).json({ success: true, data: department });
});

exports.getDepartments = catchAsync(async (req, res) => {
  const departments = await Department.find().sort("name");
  res.status(200).json({ success: true, count: departments.length, data: departments });
});

exports.getDepartment = catchAsync(async (req, res, next) => {
  const department = await Department.findById(req.params.id);
  if (!department) return next(new AppError("Department not found", 404));
  res.status(200).json({ success: true, data: department });
});

exports.updateDepartment = catchAsync(async (req, res, next) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) return next(new AppError("Department not found", 404));
  res.status(200).json({ success: true, data: department });
});

exports.deleteDepartment = catchAsync(async (req, res, next) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) return next(new AppError("Department not found", 404));
  res.status(200).json({ success: true, message: "Department deleted" });
});
