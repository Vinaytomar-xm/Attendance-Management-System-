const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
  {
    attendance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Leave"],
      required: true,
      default: "Absent",
    },
  },
  { timestamps: true }
);

// One record per student per attendance session — prevents double marking.
attendanceRecordSchema.index({ attendance: 1, student: 1 }, { unique: true });
// Speeds up "give me this student's whole attendance history" queries.
attendanceRecordSchema.index({ student: 1 });

module.exports = mongoose.model("AttendanceRecord", attendanceRecordSchema);
