// Run with: node utils/seedAdmin.js
//
// Two things this script can do:
// 1. Email doesn't exist yet -> creates a brand new admin account.
// 2. Email already exists -> just resets that account's password.
//    Nothing else changes: same email, same role, same everything else.

const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const readline = require("readline");
const User = require("../models/User");
const connectDB = require("../config/db");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

; (async () => {
  await connectDB();

  const email = (await ask("Admin email: ")).trim().toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`\nAccount found for ${email} (role: ${existing.role}).`);
    const newPassword = await ask("New password (min 8 chars): ");

    if (newPassword.length < 8) {
      console.log("Password too short. Aborted.");
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    existing.password = newPassword; // pre-save hook re-hashes it
    existing.failedLoginAttempts = 0;
    existing.lockUntil = undefined;
    await existing.save();

    console.log(`\nPassword updated for ${email}. Email and role are unchanged. Previous login sessions for this account are invalidated.`);
  } else {
    const name = await ask("Admin name: ");
    const password = await ask("Admin password (min 8 chars): ");

    if (password.length < 8) {
      console.log("Password too short. Aborted.");
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    await User.create({ name, email, password, role: "admin" });
    console.log(`\nAdmin account created for ${email}. You can now log in from the frontend.`);
  }

  rl.close();
  await mongoose.disconnect();
  process.exit(0);
})();