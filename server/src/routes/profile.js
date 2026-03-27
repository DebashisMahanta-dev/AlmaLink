import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { resumeUpload } from "../middleware/upload.js";
import { User } from "../models/User.js";

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-passwordHash");
  return res.json({ user });
});

router.patch("/me", requireAuth, async (req, res) => {
  const {
    name,
    bio,
    achievements,
    graduationYear,
    branch,
    company,
    location,
    contact
  } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (typeof name === "string" && name.trim()) {
    user.name = name.trim();
  }

  if (typeof bio === "string") {
    user.bio = bio.trim();
  }

  if (Array.isArray(achievements)) {
    user.achievements = achievements
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, 20);
  }

  if (user.role === "alumni") {
    user.alumniProfile = user.alumniProfile || {};
    if (typeof graduationYear === "string") user.alumniProfile.graduationYear = graduationYear;
    if (typeof branch === "string") user.alumniProfile.branch = branch;
    if (typeof company === "string") user.alumniProfile.company = company;
    if (typeof location === "string") user.alumniProfile.location = location;
    if (typeof contact === "string") user.alumniProfile.contact = contact;
  }

  if (user.role === "student") {
    user.studentProfile = user.studentProfile || {};
    if (typeof graduationYear === "string") user.studentProfile.graduationYear = graduationYear;
    if (typeof branch === "string") user.studentProfile.branch = branch;
  }

  await user.save();

  const updatedUser = await User.findById(user._id).select("-passwordHash");
  return res.json({ message: "Profile updated", user: updatedUser });
});

router.post("/me/resume", requireAuth, resumeUpload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Resume file is required" });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const resumeUrl =
    req.file.location ||
    `${req.protocol}://${req.get("host")}/uploads/resumes/${req.file.filename}`;
  user.resumeUrl = resumeUrl;
  await user.save();

  return res.json({ message: "Resume uploaded successfully", resumeUrl });
});

export default router;
