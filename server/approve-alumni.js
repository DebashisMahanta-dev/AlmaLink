import mongoose from "mongoose";
import { User } from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/almalink";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB\n");
    
    // Find all unapproved alumni
    const unapprovedAlumni = await User.find({ role: "alumni", approved: false });
    
    if (unapprovedAlumni.length === 0) {
      console.log("No unapproved alumni found.");
      process.exit(0);
    }
    
    console.log(`Found ${unapprovedAlumni.length} unapproved alumni:\n`);
    unapprovedAlumni.forEach(a => {
      console.log(`- ${a.name} (${a.email})`);
    });
    
    // Approve all alumni
    const result = await User.updateMany(
      { role: "alumni", approved: false },
      { $set: { approved: true } }
    );
    
    console.log(`\n✅ Approved ${result.modifiedCount} alumni successfully!`);
    
    // Verify
    const approvedCount = await User.countDocuments({ role: "alumni", approved: true });
    console.log(`Total approved alumni now: ${approvedCount}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
