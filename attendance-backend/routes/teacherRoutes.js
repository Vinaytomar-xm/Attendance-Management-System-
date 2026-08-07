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

router.get("/", restrictTo("admin"), getUsers("teacher"));
router.get("/:id", restrictTo("admin"), getUser("teacher"));
router.post("/", restrictTo("admin"), createUser("teacher"));
router.put("/:id", restrictTo("admin"), updateUser("teacher"));
router.delete("/:id", restrictTo("admin"), deleteUser("teacher"));

module.exports = router;
