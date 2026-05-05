import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";

dotenv.config();

const PROJECTS = [
  "AI-Powered Alumni Recommendation Engine",
  "Campus Placement Analytics Dashboard",
  "Internship Matching Platform",
  "Real-time Alumni-Student Chat System",
  "Resume Scoring and Feedback Tool",
  "Mentorship Session Scheduler",
  "Event RSVP and Attendance Tracker",
  "Job Posting Moderation Workflow",
  "Donation Tracking and Transparency Module",
  "Alumni Success Stories Publishing Portal"
];

const run = async () => {
  await connectDb();

  const email = "raj.singh.alumni@almalink.local";
  const existing = await User.findOne({ email });

  if (existing) {
    existing.name = "Raj Singh";
    existing.role = "alumni";
    existing.approved = true;
    existing.emailVerified = true;
    existing.projects = PROJECTS;
    existing.alumniProfile = existing.alumniProfile || {};
    existing.alumniProfile.graduationYear = existing.alumniProfile.graduationYear || "2020";
    existing.alumniProfile.branch = existing.alumniProfile.branch || "Computer Engineering";
    existing.alumniProfile.company = existing.alumniProfile.company || "TechCorp";
    existing.alumniProfile.location = existing.alumniProfile.location || "Mumbai";
    existing.alumniProfile.contact = existing.alumniProfile.contact || "+91-9000000000";
    await existing.save();
    console.log("Updated existing alumni Raj Singh with 10 projects.");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("RajSingh@123", 10);
  await User.create({
    name: "Raj Singh",
    email,
    passwordHash,
    role: "alumni",
    approved: true,
    emailVerified: true,
    onboardingCompleted: true,
    projects: PROJECTS,
    skills: ["Leadership", "System Design", "JavaScript", "Node.js", "MongoDB"],
    interests: ["Mentorship", "Career Guidance", "Product Engineering"],
    bio: "Alumni mentor focused on career growth and practical engineering skills.",
    alumniProfile: {
      graduationYear: "2020",
      branch: "Computer Engineering",
      company: "TechCorp",
      location: "Mumbai",
      contact: "+91-9000000000"
    }
  });

  console.log("Created alumni Raj Singh with 10 projects.");
  console.log("Login email: raj.singh.alumni@almalink.local");
  console.log("Login password: RajSingh@123");
  process.exit(0);
};

run().catch((err) => {
  console.error("Failed to seed Raj Singh projects:", err.message);
  process.exit(1);
});
