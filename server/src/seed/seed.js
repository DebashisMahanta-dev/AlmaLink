import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";

dotenv.config();

const run = async () => {
  await connectDb();
  const adminEmail = process.env.ADMIN_EMAIL || "adminalmalink@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "AlmaLink";

  const existing = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: "Admin",
    email: adminEmail.toLowerCase(),
    passwordHash,
    role: "admin",
    approved: true,
    emailVerified: true
  });
  console.log("Admin created");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
