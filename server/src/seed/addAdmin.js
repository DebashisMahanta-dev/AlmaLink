import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";

dotenv.config();

const run = async () => {
  await connectDb();
  
  // Get admin details from command line arguments or prompt
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || "Admin User";

  if (!email || !password) {
    console.error("Usage: node src/seed/addAdmin.js <email> <password> [name]");
    console.error("Example: node src/seed/addAdmin.js admin2@almalink.local Password123! 'John Admin'");
    process.exit(1);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`User ${email} already exists. Promoting to admin...`);
    existing.role = "admin";
    existing.approved = true;
    existing.emailVerified = true;
    await existing.save();
    console.log(`${email} promoted to admin`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "admin",
    approved: true,
    emailVerified: true
  });
  console.log(`Admin created: ${email}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
