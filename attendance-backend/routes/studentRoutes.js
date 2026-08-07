const express = require("express");
const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middlewares/auth");

const router = express.Router();

router.use(protect);

router.get("/", restrictTo("admin", "teacher"), getUsers("student"));
router.get("/:id", getUser("student")); // student can view own via /me route in frontend logic
router.post("/", restrictTo("admin"), createUser("student"));
router.put("/:id", restrictTo("admin"), updateUser("student"));
router.delete("/:id", restrictTo("admin"), deleteUser("student"));

module.exports = router;
