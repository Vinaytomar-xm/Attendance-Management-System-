const Subject = require("../models/Subject");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.createSubject = catchAsync(async (req, res, next) => {
  const { subjectName, subjectCode, semester, department } = req.body;
  if (!subjectName || !subjectCode || !semester || !department) {
    return next(new AppError("subjectName, subjectCode, semester and department are required", 400));
  }

  const subject = await Subject.create({ subjectName, subjectCode, semester, department });
  res.status(201).json({ success: true, data: subject });
});

exports.getSubjects = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.semester) filter.semester = req.query.semester;

  const subjects = await Subject.find(filter)
    .populate("department", "name code")
    .populate("assignedTeacher", "name email")
    .sort("subjectName");

  res.status(200).json({ success: true, count: subjects.length, data: subjects });
});

exports.getSubject = catchAsync(async (req, res, next) => {
  const subject = await Subject.findById(req.params.id)
    .populate("department", "name code")
    .populate("assignedTeacher", "name email");
  if (!subject) return next(new AppError("Subject not found", 404));
  res.status(200).json({ success: true, data: subject });
});

exports.updateSubject = catchAsync(async (req, res, next) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!subject) return next(new AppError("Subject not found", 404));
  res.status(200).json({ success: true, data: subject });
});

exports.deleteSubject = catchAsync(async (req, res, next) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) return next(new AppError("Subject not found", 404));
  res.status(200).json({ success: true, message: "Subject deleted" });
});

// Assigns a teacher to a subject, and keeps User.subjects in sync both ways.
exports.assignTeacher = catchAsync(async (req, res, next) => {
  const { teacherId } = req.body;
  const subject = await Subject.findById(req.params.id);
  if (!subject) return next(new AppError("Subject not found", 404));

  const teacher = await User.findOne({ _id: teacherId, role: "teacher" });
  if (!teacher) return next(new AppError("Teacher not found", 404));

  // Remove subject from any previous teacher
  if (subject.assignedTeacher) {
    await User.findByIdAndUpdate(subject.assignedTeacher, { $pull: { subjects: subject._id } });
  }

  subject.assignedTeacher = teacher._id;
  await subject.save();

  await User.findByIdAndUpdate(teacher._id, { $addToSet: { subjects: subject._id } });

  res.status(200).json({ success: true, message: "Teacher assigned", data: subject });
});
