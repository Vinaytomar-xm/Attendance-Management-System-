const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    subjectCode: {
      type: String,
      required: [true, "Subject code is required"],
      uppercase: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    assignedTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate subject code within the same department + semester
subjectSchema.index({ subjectCode: 1, department: 1, semester: 1 }, { unique: true });


module.exports = mongoose.model("Subject", subjectSchema);
