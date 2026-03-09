import express from "express";
import { User } from "../models/User.js";
import Post from "../models/Post.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const { year, branch, location, company, name } = req.query;
  const query = { role: "alumni", approved: true, _id: { $ne: req.user._id } }; // Exclude current user
  if (year) query["alumniProfile.graduationYear"] = year;
  if (branch) query["alumniProfile.branch"] = branch;
  if (location) query["alumniProfile.location"] = new RegExp(location, "i");
  if (company) query["alumniProfile.company"] = new RegExp(company, "i");
  if (name) query.name = new RegExp(name, "i");

  const alumni = await User.find(query).select("name email alumniProfile");
  return res.json({ alumni });
});

// Get specific user profile with their posts
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.id,
      approved: true 
    }).select("name email role alumniProfile studentProfile createdAt");

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
