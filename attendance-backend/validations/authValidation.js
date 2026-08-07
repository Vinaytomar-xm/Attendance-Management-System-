const { body } = require("express-validator");

exports.registerValidation = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2-80 characters"),
  body("email").isEmail().withMessage("Enter a valid email").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number"),
  body("role").isIn(["admin", "teacher", "student"]).withMessage("Invalid role"),
  body("department").if(body("role").isIn(["student", "teacher"])).notEmpty().withMessage("Department is required"),
  body("rollNo").if(body("role").equals("student")).notEmpty().withMessage("Roll number is required"),
  body("semester")
    .if(body("role").equals("student"))
    .isInt({ min: 1, max: 12 })
    .withMessage("Semester must be between 1 and 12"),
];

exports.loginValidation = [
  body("email").isEmail().withMessage("Enter a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];
