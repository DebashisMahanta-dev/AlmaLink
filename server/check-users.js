import mongoose from "mongoose";
import { User } from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/almalink";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB\n");
    
    const users = await User.find({});
    console.log("Total Users:", users.length);
    console.log("\nUser Details:");
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) - Role: ${u.role} - Approved: ${u.approved}`);
    });
    
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      console.log("\n✅ Admin user found:");
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
    } else {
      console.log("\n❌ No admin user found in database!");
      console.log("   Run: npm run seed");
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
