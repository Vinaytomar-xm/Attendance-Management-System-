const express = require("express");
const {
  markAttendance,
  getSessionRoster,
  getStudentSummary,
  getDashboardStats,
  getTeacherOverview,
  getStudentClasses,
} = require("../controllers/attendanceController");
const { protect, restrictTo } = require("../middlewares/auth");

const router = express.Router();

router.use(protect);

router.get("/dashboard-stats", restrictTo("admin"), getDashboardStats);
router.get("/roster", restrictTo("admin", "teacher"), getSessionRoster);
router.post("/mark", restrictTo("admin", "teacher"), markAttendance);
router.get("/summary/:studentId?", getStudentSummary);
router.get("/teacher-overview/:teacherId?", restrictTo("admin", "teacher"), getTeacherOverview);
router.get("/my-classes/:studentId?", getStudentClasses);

module.exports = router;