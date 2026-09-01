const Attendance = require("../models/Attendance");
const AttendanceRecord = require("../models/AttendanceRecord");
const Subject = require("../models/Subject");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const normalizeDate = (date) => {
  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// Teacher marks attendance for a whole class in one shot.
// Body: { subjectId, className, date, records: [{ studentId, status }] }
exports.markAttendance = catchAsync(async (req, res, next) => {
  const { subjectId, className, date, records } = req.body;

  if (!subjectId || !Array.isArray(records) || records.length === 0) {
    return next(new AppError("subjectId and a non-empty records array are required", 400));
  }

  const subject = await Subject.findById(subjectId);
  if (!subject) return next(new AppError("Subject not found", 404));

  // Only the teacher assigned to this subject (or an admin) can mark it.
  if (req.user.role === "teacher" && String(subject.assignedTeacher) !== String(req.user._id)) {
    return next(new AppError("You are not assigned to this subject.", 403));
  }

  const sessionDate = normalizeDate(date);

  // Prevents duplicate sessions — also enforced at the DB level by a unique index.
  const existing = await Attendance.findOne({
    teacher: req.user._id,
    subject: subjectId,
    className: className || "",
    date: sessionDate,
  });
  if (existing) {
    return next(new AppError("Attendance for this class, subject and date has already been marked.", 409));
  }

  const attendance = await Attendance.create({
    date: sessionDate,
    teacher: req.user._id,
    subject: subjectId,
    department: subject.department,
    semester: subject.semester,
    className: className || "",
  });

  const recordDocs = records.map((r) => ({
    attendance: attendance._id,
    student: r.studentId,
    status: r.status,
  }));

  await AttendanceRecord.insertMany(recordDocs, { ordered: false });

  res.status(201).json({
    success: true,
    message: "Attendance marked successfully",
    data: { attendanceId: attendance._id, totalMarked: recordDocs.length },
  });
});

// Get roster + existing marks (if any) for a subject/class/date — used to
// pre-fill the teacher's marking screen and to check "already marked?".
exports.getSessionRoster = catchAsync(async (req, res, next) => {
  const { subjectId, className, date } = req.query;
  if (!subjectId) return next(new AppError("subjectId is required", 400));

  const subject = await Subject.findById(subjectId);
  if (!subject) return next(new AppError("Subject not found", 404));

  const students = await User.find({
    role: "student",
    department: subject.department,
    semester: subject.semester,
  })
    .select("name rollNo")
    .sort("rollNo");

  const sessionDate = normalizeDate(date);
  const existingSession = await Attendance.findOne({
    subject: subjectId,
    className: className || "",
    date: sessionDate,
  });

  let existingMarks = [];
  if (existingSession) {
    existingMarks = await AttendanceRecord.find({ attendance: existingSession._id }).select("student status");
  }

  res.status(200).json({
    success: true,
    alreadyMarked: !!existingSession,
    students,
    existingMarks,
  });
});

// Student's own attendance summary (overall + per-subject).
exports.getStudentSummary = catchAsync(async (req, res, next) => {
  const studentId = req.params.studentId || req.user._id;

  // Students may only view their own summary; admins/teachers can view any.
  if (req.user.role === "student" && String(studentId) !== String(req.user._id)) {
    return next(new AppError("You can only view your own attendance.", 403));
  }

  const records = await AttendanceRecord.find({ student: studentId }).populate({
    path: "attendance",
    select: "subject date",
    populate: { path: "subject", select: "subjectName subjectCode" },
  });

  const totalClasses = records.length;
  const presentCount = records.filter((r) => r.status === "Present" || r.status === "Late").length;
  const overallPercentage = totalClasses ? Number(((presentCount / totalClasses) * 100).toFixed(2)) : 0;

  // Group by subject
  const bySubject = {};
  for (const r of records) {
    const subj = r.attendance?.subject;
    if (!subj) continue;
    const key = String(subj._id);
    if (!bySubject[key]) {
      bySubject[key] = {
        subjectId: subj._id,
        subjectName: subj.subjectName,
        subjectCode: subj.subjectCode,
        total: 0,
        present: 0,
      };
    }
    bySubject[key].total += 1;
    if (r.status === "Present" || r.status === "Late") bySubject[key].present += 1;
  }

  const subjectWise = Object.values(bySubject).map((s) => ({
    ...s,
    percentage: s.total ? Number(((s.present / s.total) * 100).toFixed(2)) : 0,
  }));

  res.status(200).json({
    success: true,
    data: {
      totalClasses,
      present: presentCount,
      absent: totalClasses - presentCount,
      overallPercentage,
      subjectWise,
    },
  });
});

// Teacher's overview: every subject assigned to them, how many students
// are enrolled in each (by department+semester), which class/sections
// they've actually held sessions for, and how many sessions so far.
exports.getTeacherOverview = catchAsync(async (req, res, next) => {
  const teacherId = req.params.teacherId || req.user._id;

  if (req.user.role === "teacher" && String(teacherId) !== String(req.user._id)) {
    return next(new AppError("You can only view your own class overview.", 403));
  }

  const subjects = await Subject.find({ assignedTeacher: teacherId }).populate("department", "name code");

  let totalStudents = 0;
  const subjectOverview = [];

  for (const subject of subjects) {
    const studentCount = await User.countDocuments({
      role: "student",
      department: subject.department._id,
      semester: subject.semester,
    });
    totalStudents += studentCount;

    const sections = await Attendance.distinct("className", { subject: subject._id, teacher: teacherId });
    const sessionsHeld = await Attendance.countDocuments({ subject: subject._id, teacher: teacherId });

    subjectOverview.push({
      subjectId: subject._id,
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      department: subject.department.code,
      semester: subject.semester,
      studentCount,
      sections: sections.filter((s) => s).length ? sections.filter((s) => s) : ["(no section label)"],
      sessionsHeld,
    });
  }

  res.status(200).json({
    success: true,
    data: {
      totalSubjects: subjects.length,
      totalStudents,
      subjects: subjectOverview,
    },
  });
});

// Student's own enrolled classes: every subject that matches their
// department + semester, with the assigned teacher and their attendance
// percentage in that specific subject — even for subjects with 0 classes
// held yet.
exports.getStudentClasses = catchAsync(async (req, res, next) => {
  const studentId = req.params.studentId || req.user._id;

  if (req.user.role === "student" && String(studentId) !== String(req.user._id)) {
    return next(new AppError("You can only view your own classes.", 403));
  }

  const student = await User.findOne({ _id: studentId, role: "student" });
  if (!student) return next(new AppError("Student not found", 404));

  const subjects = await Subject.find({
    department: student.department,
    semester: student.semester,
  }).populate("assignedTeacher", "name email");

  const classes = [];
  for (const subject of subjects) {
    const sessions = await Attendance.find({ subject: subject._id }).select("_id");
    const sessionIds = sessions.map((s) => s._id);

    const records = await AttendanceRecord.find({
      attendance: { $in: sessionIds },
      student: studentId,
    });

    const total = records.length;
    const present = records.filter((r) => r.status === "Present" || r.status === "Late").length;

    classes.push({
      subjectId: subject._id,
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      teacherName: subject.assignedTeacher?.name || "Not assigned yet",
      totalClasses: total,
      present,
      percentage: total ? Number(((present / total) * 100).toFixed(2)) : 0,
    });
  }

  res.status(200).json({ success: true, data: classes });
});

// Admin dashboard quick stats
exports.getDashboardStats = catchAsync(async (req, res) => {
  const [totalStudents, totalTeachers, totalSubjects, todaysSessions] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "teacher" }),
    Subject.countDocuments(),
    Attendance.countDocuments({ date: normalizeDate(new Date()) }),
  ]);

  const Department = require("../models/Department");
  const totalDepartments = await Department.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      totalTeachers,
      totalSubjects,
      totalDepartments,
      todaysSessions,
    },
  });
});