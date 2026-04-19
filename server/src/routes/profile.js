import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { profilePhotoUpload, resumeUpload, bannerUpload } from "../middleware/upload.js";
import { User } from "../models/User.js";

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user });
  } catch (err) {
    console.error("Error loading profile:", err);
    return res.status(500).json({ message: "Failed to load profile" });
  }
});

router.patch("/me", requireAuth, async (req, res) => {
  try {
    const {
      name,
      photoUrl,
      bannerUrl,
      bio,
      skills,
      interests,
      projects,
      achievements,
      graduationYear,
      branch,
      currentYear,
      college,
      country,
      onboardingCompleted,
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

    if (typeof photoUrl === "string") {
      user.photoUrl = photoUrl.trim();
    }

    if (typeof bannerUrl === "string") {
      user.bannerUrl = bannerUrl.trim();
    }

    if (typeof onboardingCompleted === "boolean") {
      user.onboardingCompleted = onboardingCompleted;
    }

    if (Array.isArray(achievements)) {
      user.achievements = achievements
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .slice(0, 20);
    }

    if (Array.isArray(skills)) {
      user.skills = skills
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .slice(0, 30);
    }

    if (Array.isArray(interests)) {
      user.interests = interests
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .slice(0, 30);
    }

    if (Array.isArray(projects)) {
      user.projects = projects
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
      if (typeof currentYear === "string") user.studentProfile.currentYear = currentYear;
      if (typeof college === "string") user.studentProfile.college = college;
      if (typeof country === "string") user.studentProfile.country = country;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-passwordHash");
    return res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

router.post("/me/photo", requireAuth, profilePhotoUpload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Profile photo is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const photoUrl =
      req.file.location ||
      `${req.protocol}://${req.get("host")}/uploads/profiles/${req.file.filename}`;

    user.photoUrl = photoUrl;
    await user.save();

    return res.json({ message: "Profile photo uploaded successfully", photoUrl });
  } catch (err) {
    console.error("Error uploading profile photo:", err);
    return res.status(500).json({ message: "Failed to upload profile photo" });
  }
});

router.post("/me/banner", requireAuth, bannerUpload.single("banner"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Banner image is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bannerUrl =
      req.file.location ||
      `${req.protocol}://${req.get("host")}/uploads/profiles/${req.file.filename}`;

    user.bannerUrl = bannerUrl;
    await user.save();

    return res.json({ message: "Banner uploaded successfully", bannerUrl });
  } catch (err) {
    console.error("Error uploading banner image:", err);
    return res.status(500).json({ message: "Failed to upload banner image" });
  }
});

router.post("/me/resume", requireAuth, resumeUpload.single("resume"), async (req, res) => {
  try {
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
  } catch (err) {
    console.error("Error uploading resume:", err);
    return res.status(500).json({ message: "Failed to upload resume" });
  }
});

export default router;
