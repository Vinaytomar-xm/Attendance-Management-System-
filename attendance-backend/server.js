const dotenv = require("dotenv");
dotenv.config();
  
const app = require("./app");
const connectDB = require("./config/db");

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });

  process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION 💥 Shutting down...");
    console.error(err.name, err.message);
    server.close(() => process.exit(1));
  });
};

startServer();