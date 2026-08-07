const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");

const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/AppError");

const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();

// Trust first proxy (needed on Render/Heroku etc. for secure cookies + rate limiting to work correctly)
app.set("trust proxy", 1);

// ---- Security middleware ----
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL, // exact frontend origin only, not "*"
    credentials: true, // required so the httpOnly cookie is sent/accepted cross-origin
  })
);

// Body parsers with size limits (mitigates large-payload DoS)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Sanitize against NoSQL query injection (e.g. { "$gt": "" } in body/query/params)
app.use(mongoSanitize());

// Prevent HTTP parameter pollution
app.use(hpp());

// General API rate limiter (per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
});
app.use("/api", apiLimiter);

// ---- Health check ----
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy", time: new Date().toISOString() });
});

// ---- Routes ----
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/attendance", attendanceRoutes);

// ---- 404 handler ----
app.all("*", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// ---- Global error handler (must be last) ----
app.use(errorHandler);

module.exports = app;
