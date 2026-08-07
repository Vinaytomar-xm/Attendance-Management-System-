const mongoose = require("mongoose");

// One "session" per class per subject per date.
// Individual student marks live in AttendanceRecord (kept separate
// because a single session can have hundreds of student entries).
const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    className: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Stops the exact same session (same teacher+subject+class+date) being created twice.
// Dates are normalized to midnight in the controller before saving, so this
// index reliably blocks duplicates even under concurrent requests.
attendanceSchema.index(
  { teacher: 1, subject: 1, className: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
