import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { Job } from "../models/Job.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jobsFilePath = path.join(__dirname, "jobs.json");
const seedAlumniEmail = "seed.jobs.alumni@almalink.local";

const run = async () => {
  await connectDb();

  const seedAlumniPassword = process.env.SEED_ALUMNI_PASSWORD || "SeedJobs123!";
  const seedAlumniPasswordHash = await bcrypt.hash(seedAlumniPassword, 10);

  let seedAlumni = await User.findOne({ email: seedAlumniEmail });
  if (!seedAlumni) {
    seedAlumni = await User.create({
      name: "Seed Alumni",
      email: seedAlumniEmail,
      passwordHash: seedAlumniPasswordHash,
      role: "alumni",
      approved: true,
      emailVerified: true,
      alumniProfile: {
        branch: "Computer Science",
        graduationYear: 2022,
        skills: ["React", "Node.js", "MongoDB"],
        location: "Kolkata"
      }
    });
    console.log("Seed alumni created");
  } else {
    await User.updateOne(
      { _id: seedAlumni._id },
      {
        $set: {
          role: "alumni",
          approved: true,
          emailVerified: true,
          alumniProfile: {
            branch: seedAlumni.alumniProfile?.branch || "Computer Science",
            graduationYear: seedAlumni.alumniProfile?.graduationYear || 2022,
            skills: seedAlumni.alumniProfile?.skills?.length ? seedAlumni.alumniProfile.skills : ["React", "Node.js", "MongoDB"],
            location: seedAlumni.alumniProfile?.location || "Kolkata"
          }
        }
      }
    );
    console.log("Seed alumni reused");
  }

  const raw = await fs.readFile(jobsFilePath, "utf8");
  const jobTemplates = JSON.parse(raw);

  await Job.deleteMany({ postedBy: seedAlumni._id });

  const now = Date.now();
  const jobs = jobTemplates.map((job) => ({
    ...job,
    expiryDate: new Date(now + Number(job.expiryDays || 30) * 24 * 60 * 60 * 1000),
    postedBy: seedAlumni._id
  }));

  const inserted = await Job.insertMany(jobs);
  console.log(`Inserted ${inserted.length} job posts`);

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
