import mongoose from "mongoose";
import { User } from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/almalink";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB\n");
    
    const alumni = await User.find({ role: "alumni" });
    console.log("Total Alumni:", alumni.length);
    console.log("Approved Alumni:", alumni.filter(a => a.approved).length);
    console.log("\nAlumni Details:");
    alumni.forEach(a => {
      console.log(`- ${a.name} (${a.email}) - Approved: ${a.approved}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
