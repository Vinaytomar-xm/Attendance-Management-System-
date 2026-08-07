const AppError = require("../utils/AppError");

const handleCastError = (err) => new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldError = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || "field";
  return new AppError(`Duplicate value for ${field}. Please use another value.`, 409);
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid input: ${messages.join(". ")}`, 400);
};

const handleJWTError = () => new AppError("Invalid session token. Please log in again.", 401);
const handleJWTExpired = () => new AppError("Session expired. Please log in again.", 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err, message: err.message, name: err.name };

  if (error.name === "CastError") error = handleCastError(error);
  if (error.code === 11000) error = handleDuplicateFieldError(error);
  if (error.name === "ValidationError") error = handleValidationError(error);
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpired();

  // Never leak stack traces or raw error internals to the client.
  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational;

  if (process.env.NODE_ENV === "development") {
    console.error("ERROR 💥", err);
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? error.message : "Something went wrong. Please try again later.",
  });
};
