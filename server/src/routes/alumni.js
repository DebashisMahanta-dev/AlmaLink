import express from "express";
import { User } from "../models/User.js";
import Post from "../models/Post.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const toSafeRegex = (value) => {
  const safe = String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(safe, "i");
};

router.get("/", requireAuth, async (req, res) => {
  const { year, branch, location, company, name, skill } = req.query;
  const query = {
    role: { $in: ["alumni", "student"] },
    approved: true,
    _id: { $ne: req.user._id }
  };
  const andConditions = [];

  if (year) {
    const yearText = String(year).trim();
    andConditions.push({
      $or: [
        { "alumniProfile.graduationYear": yearText },
        { "studentProfile.graduationYear": yearText }
      ]
    });
  }
  if (branch) {
    const branchRegex = toSafeRegex(branch);
    andConditions.push({
      $or: [
        { "alumniProfile.branch": branchRegex },
        { "studentProfile.branch": branchRegex }
      ]
    });
  }
  if (location) {
    const locationRegex = toSafeRegex(location);
    andConditions.push({
      $or: [
        { "alumniProfile.location": locationRegex },
        { "studentProfile.country": locationRegex }
      ]
    });
  }
  if (company) andConditions.push({ "alumniProfile.company": toSafeRegex(company) });
  if (name) andConditions.push({ name: toSafeRegex(name) });
  if (skill) andConditions.push({ skills: toSafeRegex(skill) });

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  const alumni = await User.find(query).select("name email role photoUrl alumniProfile studentProfile skills");
  return res.json({ alumni });
});

router.get("/skills", requireAuth, async (req, res) => {
  const skillRows = await User.aggregate([
    { $match: { role: { $in: ["alumni", "student"] }, approved: true } },
    { $unwind: "$skills" },
    {
      $project: {
        skill: {
          $trim: {
            input: { $toString: "$skills" }
          }
        }
      }
    },
    { $match: { skill: { $ne: "" } } },
    { $group: { _id: "$skill" } },
    { $sort: { _id: 1 } }
  ]);

  const skills = skillRows.map((row) => row._id);
  return res.json({ skills });
});

// Get specific user profile with their posts
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.id,
      approved: true 
    }).select("name email role bio achievements resumeUrl alumniProfile studentProfile createdAt");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's posts
    const posts = await Post.find({ author: req.params.id })
      .populate("author", "name email alumniProfile studentProfile")
      .populate("likes", "_id name")
      .populate("comments.user", "_id name")
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({ user, posts });
  } catch (err) {
    console.error("Get user profile error:", err);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

export default router;
