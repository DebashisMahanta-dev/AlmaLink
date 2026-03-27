import mongoose from "mongoose";
import { User } from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/almalink";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB\n");
    
    // Update all admin users to have emailVerified = true
    const result = await User.updateMany(
      { role: "admin" },
      { $set: { emailVerified: true } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} admin user(s)`);
    console.log("All admin accounts are now email-verified and can log in.\n");
    
    // Show all admins
    const admins = await User.find({ role: "admin" });
    console.log("Admin Accounts:");
    admins.forEach(admin => {
      console.log(`  - ${admin.email} (Verified: ${admin.emailVerified})`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
