import express from "express";
import { Job } from "../models/Job.js";
import { Application } from "../models/Application.js";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = express.Router();

const normalizeText = (value = "") =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const collectJobText = (job) =>
  normalizeText([job.title, job.company, job.location, job.type, job.description, ...(job.roles || [])].join(" "));

const buildDuplicateSignature = (job = {}) => ({
  title: normalizeText(job.title),
  company: normalizeText(job.company),
  location: normalizeText(job.location),
  type: normalizeText(job.type),
  roles: [...(job.roles || [])].map((role) => normalizeText(role)).sort().join("|")
});

const isSameJobSignature = (jobA, jobB) => {
  const a = buildDuplicateSignature(jobA);
  const b = buildDuplicateSignature(jobB);
  return (
    a.title === b.title &&
    a.company === b.company &&
    a.location === b.location &&
    a.type === b.type &&
    a.roles === b.roles
  );
};

const scoreJob = (job, skills = []) => {
  const jobText = collectJobText(job);
  const matchedSkills = [];
  let score = 0;

  skills.forEach((skill) => {
    const normalizedSkill = normalizeText(skill);
    if (!normalizedSkill) return;

    const skillTokens = normalizedSkill.split(" ").filter(Boolean);
    const exactHit = jobText.includes(normalizedSkill);
    const tokenHits = skillTokens.filter((token) => jobText.includes(token)).length;

    if (exactHit) {
      matchedSkills.push(skill);
      score += 3;
    } else if (tokenHits > 0) {
      matchedSkills.push(skill);
      score += Math.min(2, tokenHits);
    }
  });

  const uniqueMatchedSkills = [...new Set(matchedSkills)];

  return {
    score,
    matchedSkills: uniqueMatchedSkills
  };
};

router.get("/", requireAuth, async (req, res) => {
  const now = new Date();
  const jobs = await Job.find({
    $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gte: now } }]
  }).populate("postedBy", "name email photoUrl alumniProfile");
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

router.get("/recommended", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("skills studentProfile branch alumniProfile");
    const skills = Array.isArray(user?.skills) ? user.skills.filter(Boolean) : [];
    const profileKeywords = [
      user?.studentProfile?.branch,
      user?.studentProfile?.currentYear,
      user?.studentProfile?.college,
      user?.studentProfile?.country
    ].filter(Boolean);

    const now = new Date();
    const jobs = await Job.find({
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gte: now } }]
    }).populate("postedBy", "name email photoUrl alumniProfile");

    const rankedJobs = jobs
      .map((job) => {
        const skillResult = scoreJob(job, skills);
        const profileResult = scoreJob(job, profileKeywords);
        const rawScore = skillResult.score * 3 + profileResult.score;
        const maxScore = Math.max(1, skills.length * 3 + profileKeywords.length);
        const matchScore = Math.min(100, Math.round((rawScore / maxScore) * 100));

        return {
          ...job.toObject(),
          matchScore,
          matchScoreRaw: rawScore,
          matchedSkills: [...new Set([...skillResult.matchedSkills, ...profileResult.matchedSkills])]
        };
      })
      .filter((job) => job.matchScore > 0 || skills.length === 0)
      .sort((a, b) => {
        if (b.matchScoreRaw !== a.matchScoreRaw) return b.matchScoreRaw - a.matchScoreRaw;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });

    return res.json({
      recommendedJobs: rankedJobs.slice(0, 8),
      skills
    });
  } catch (err) {
    console.error("Error loading recommended jobs:", err);
    return res.status(500).json({ message: "Failed to load recommended jobs" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email photoUrl alumniProfile");
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

    const now = new Date();
    const activeJobs = await Job.find({
      postedBy: req.user._id,
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gte: now } }]
    }).sort({ createdAt: -1 });

    const duplicateJob = activeJobs.find((job) =>
      isSameJobSignature(
        {
          title,
          company,
          location,
          type,
          roles: validRoles
        },
        job
      )
    );

    if (duplicateJob) {
      return res.status(409).json({
        message: "Job already posted with same details",
        duplicateJob: {
          _id: duplicateJob._id,
          title: duplicateJob.title,
          company: duplicateJob.company,
          location: duplicateJob.location,
          type: duplicateJob.type
        },
        canRepost: true
      });
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

router.post("/:id/repost", requireAuth, requireRole("alumni"), async (req, res) => {
  try {
    if (!req.user.approved) {
      return res.status(403).json({ message: "Alumni approval required" });
    }

    const sourceJob = await Job.findById(req.params.id);
    if (!sourceJob) {
      return res.status(404).json({ message: "Original job not found" });
    }

    if (sourceJob.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only repost your own jobs" });
    }

    const { expiryDate, roles } = req.body || {};
    const validRoles = Array.isArray(roles) && roles.length > 0 ? roles : sourceJob.roles;
    if (!validRoles.every((role) => ["freshers", "experienced"].includes(role))) {
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
    } else {
      parsedExpiryDate = sourceJob.expiryDate;
    }

    const repostedJob = await Job.create({
      title: sourceJob.title,
      company: sourceJob.company,
      location: sourceJob.location,
      type: sourceJob.type,
      description: sourceJob.description,
      roles: validRoles,
      expiryDate: parsedExpiryDate,
      postedBy: req.user._id
    });

    return res.status(201).json({
      message: "Job reposted successfully",
      job: repostedJob
    });
  } catch (err) {
    console.error("Error reposting job:", err);
    return res.status(500).json({ message: err.message || "Failed to repost job" });
  }
});

router.post("/:id/apply", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Not found" });
    if (job.expiryDate && job.expiryDate < new Date()) {
      return res.status(400).json({ message: "This job post has expired" });
    }

    const resumeUrl = req.user.resumeUrl;
    if (!resumeUrl) {
      return res.status(400).json({
        message: "Resume is required. Please upload your resume in Profile before applying."
      });
    }

    const existingApplication = await Application.findOne({
      job: job._id,
      student: req.user._id
    });
    if (existingApplication) {
      return res.status(409).json({
        message: "You have already applied to this job."
      });
    }

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
