const jwt = require("jsonwebtoken");

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Sends the JWT as an httpOnly cookie so it can never be read by JS in the
// browser (protects against XSS token theft). SameSite + secure flags guard
// against CSRF-style leakage across origins in production.
const sendTokenCookie = (res, token) => {
  const expiresInDays = Number(process.env.COOKIE_EXPIRES_DAYS) || 7;

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: expiresInDays * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

module.exports = { generateToken, sendTokenCookie };
