const express = require("express");
const {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
  assignTeacher,
} = require("../controllers/subjectController");
const { protect, restrictTo } = require("../middlewares/auth");

const router = express.Router();

router.use(protect);

router.get("/", getSubjects);
router.get("/:id", getSubject);
router.post("/", restrictTo("admin"), createSubject);
router.put("/:id", restrictTo("admin"), updateSubject);
router.delete("/:id", restrictTo("admin"), deleteSubject);
router.patch("/:id/assign-teacher", restrictTo("admin"), assignTeacher);

module.exports = router;
