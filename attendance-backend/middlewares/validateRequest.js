const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

// Runs after express-validator's chain() calls; collects errors and
// converts them into our standard AppError shape.
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(", ");
    return next(new AppError(message, 400));
  }
  next();
};
