import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { Job } from "../models/Job.js";

dotenv.config();

const JOBS = [
  { title: "Software Engineer Intern", company: "TechCorp", location: "Bengaluru", type: "Internship", description: "Work on frontend and backend modules for student-facing products.", roles: ["freshers"] },
  { title: "Backend Developer", company: "TechCorp", location: "Hyderabad", type: "Full-time", description: "Build APIs in Node.js and maintain MongoDB data models.", roles: ["freshers", "experienced"] },
  { title: "Frontend React Developer", company: "Innova Labs", location: "Pune", type: "Full-time", description: "Develop reusable React components and improve UX performance.", roles: ["freshers", "experienced"] },
  { title: "Data Analyst Trainee", company: "InsightWorks", location: "Mumbai", type: "Full-time", description: "Analyze placement and engagement data, build dashboard insights.", roles: ["freshers"] },
  { title: "QA Automation Engineer", company: "QualityFirst", location: "Chennai", type: "Full-time", description: "Design automation test suites for web applications.", roles: ["freshers", "experienced"] },
  { title: "DevOps Associate", company: "CloudBridge", location: "Remote", type: "Full-time", description: "Support CI/CD pipelines, monitoring, and cloud deployment workflows.", roles: ["experienced"] },
  { title: "Product Support Intern", company: "CampusConnect", location: "Kolkata", type: "Internship", description: "Handle customer issues and improve product documentation.", roles: ["freshers"] },
  { title: "Full Stack Developer", company: "NextGen Apps", location: "Noida", type: "Full-time", description: "Own full stack features using React, Node.js, and MongoDB.", roles: ["freshers", "experienced"] },
  { title: "Machine Learning Intern", company: "AI Matrix", location: "Remote", type: "Internship", description: "Assist in model training and feature engineering for recommendation systems.", roles: ["freshers"] },
  { title: "Technical Program Coordinator", company: "ScaleOps", location: "Gurugram", type: "Contract", description: "Coordinate engineering tasks and release communication.", roles: ["experienced"] }
];

const run = async () => {
  await connectDb();

  const email = "raj.singh.alumni@almalink.local";
  let raj = await User.findOne({ email });

  if (!raj) {
    const passwordHash = await bcrypt.hash("RajSingh@123", 10);
    raj = await User.create({
      name: "Raj Singh",
      email,
      passwordHash,
      role: "alumni",
      approved: true,
      emailVerified: true,
      onboardingCompleted: true,
      alumniProfile: {
        graduationYear: "2020",
        branch: "Computer Engineering",
        company: "TechCorp",
        location: "Mumbai",
        contact: "+91-9000000000"
      }
    });
    console.log("Created alumni Raj Singh.");
  } else if (raj.role !== "alumni" || !raj.approved) {
    raj.role = "alumni";
    raj.approved = true;
    raj.emailVerified = true;
    raj.alumniProfile = raj.alumniProfile || {};
    await raj.save();
  }

  await Job.deleteMany({ postedBy: raj._id });

  const now = Date.now();
  const payload = JOBS.map((job, idx) => ({
    ...job,
    postedBy: raj._id,
    expiryDate: new Date(now + (30 + idx) * 24 * 60 * 60 * 1000)
  }));

  const inserted = await Job.insertMany(payload);
  console.log(`Inserted ${inserted.length} jobs for Raj Singh.`);
  process.exit(0);
};

run().catch((err) => {
  console.error("Failed to seed Raj Singh jobs:", err.message);
  process.exit(1);
});
