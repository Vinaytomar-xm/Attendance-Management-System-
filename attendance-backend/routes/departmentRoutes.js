const express = require("express");
const {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");
const { protect, restrictTo } = require("../middlewares/auth");

const router = express.Router();

router.use(protect);

router.get("/", getDepartments);
router.get("/:id", getDepartment);
router.post("/", restrictTo("admin"), createDepartment);
router.put("/:id", restrictTo("admin"), updateDepartment);
router.delete("/:id", restrictTo("admin"), deleteDepartment);

module.exports = router;
