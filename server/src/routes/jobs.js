import express from "express";
import { Job } from "../models/Job.js";
import { Application } from "../models/Application.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { resumeUpload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const now = new Date();
  const jobs = await Job.find({
    $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gte: now } }]
  }).populate("postedBy", "name email alumniProfile");
  return res.json({ jobs });
});

// Get current user's job posts (for alumni) - MUST come before /:id route
router.get("/my-posts", requireAuth, requireRole("alumni"), async (req, res) => {
  try {
    const now = new Date();
    const jobs = await Job.find({
      postedBy: req.user._id,
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gte: now } }]
    }).sort({ createdAt: -1 });
    return res.json({ jobs });
  } catch (err) {
    console.error("Error fetching user's jobs:", err);
    return res.status(500).json({ message: "Failed to fetch job posts" });
  }
});

// Get student's job applications - MUST come before /:id route
router.get("/me/applications", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate("job", "title company location")
      .sort({ createdAt: -1 });
    return res.json({ applications });
  } catch (err) {
    console.error("Error fetching applications:", err);
    return res.status(500).json({ message: "Failed to fetch applications" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email alumniProfile");
    if (!job) return res.status(404).json({ message: "Not found" });
    if (job.expiryDate && job.expiryDate < new Date()) {
      return res.status(404).json({ message: "Not found" });
    }
    return res.json({ job });
  } catch (err) {
    console.error("Error fetching job:", err);
    return res.status(500).json({ message: "Failed to fetch job details" });
  }
});

router.post("/", requireAuth, requireRole("alumni"), async (req, res) => {
  try {
    if (!req.user.approved) {
      return res.status(403).json({ message: "Alumni approval required" });
    }
    const { title, company, location, type, description, expiryDate, roles } = req.body;
    if (!title || !company || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (roles && !Array.isArray(roles)) {
      return res.status(400).json({ message: "Roles must be an array" });
    }
    const validRoles = roles && roles.length > 0 ? roles : ["freshers", "experienced"];
    if (!validRoles.every(role => ["freshers", "experienced"].includes(role))) {
      return res.status(400).json({ message: "Invalid role. Valid roles are: freshers, experienced" });
    }
    let parsedExpiryDate;
    if (expiryDate) {
      parsedExpiryDate = new Date(expiryDate);
      if (Number.isNaN(parsedExpiryDate.getTime())) {
        return res.status(400).json({ message: "Invalid expiry date" });
      }
      if (parsedExpiryDate <= new Date()) {
        return res.status(400).json({ message: "Expiry date must be in the future" });
      }
    }

    const job = await Job.create({
      title,
      company,
      location,
      type,
      description,
      roles: validRoles,
      expiryDate: parsedExpiryDate,
      postedBy: req.user._id
    });
    console.log("Job created successfully:", job);
    return res.status(201).json({ job });
  } catch (err) {
    console.error("Error creating job:", err);
    return res.status(500).json({ message: err.message || "Failed to create job" });
  }
});

router.post("/:id/apply", requireAuth, requireRole("student"), resumeUpload.single("resume"), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Not found" });
    if (job.expiryDate && job.expiryDate < new Date()) {
      return res.status(400).json({ message: "This job post has expired" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "Resume is required" });
    }

    // Handle both S3 (location) and local storage (filename)
    const resumeUrl = req.file.location || `/uploads/resumes/${req.file.filename}`;
    const { coverLetter } = req.body;

    const application = await Application.create({
      job: job._id,
      student: req.user._id,
      resumeUrl,
      coverLetter
    });

    console.log("Application created successfully:", application);
    return res.status(201).json({ application });
  } catch (err) {
    console.error("Error creating application:", err);
    return res.status(500).json({ message: err.message || "Failed to submit application" });
  }
});

router.get("/:id/applications", requireAuth, requireRole("alumni"), async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Not found" });
  if (job.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const applications = await Application.find({ job: job._id })
    .populate("student", "name email studentProfile")
    .sort({ createdAt: -1 });
  return res.json({ applications });
});

// Delete a job post (only by the alumni who posted it)
router.delete("/:id", requireAuth, requireRole("alumni"), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own job posts" });
    }
    await Job.findByIdAndDelete(req.params.id);
    return res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("Error deleting job:", err);
    return res.status(500).json({ message: "Failed to delete job" });
  }
});

export default router;
