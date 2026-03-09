import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { User } from "../models/User.js";
import { Job } from "../models/Job.js";

const router = express.Router();

router.get("/pending-alumni", requireAuth, requireRole("admin"), async (req, res) => {
  const alumni = await User.find({ role: "alumni", approved: false }).select("name email alumniProfile");
  return res.json({ alumni });
});

router.patch("/approve/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: "alumni" },
    { approved: true },
    { new: true }
  ).select("name email role approved");
  if (!user) return res.status(404).json({ message: "Not found" });
  return res.json({ user });
});

router.delete("/jobs/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) return res.status(404).json({ message: "Not found" });
  return res.json({ success: true });
});

// Admin Management
router.get("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const users = await User.find().select("name email role approved createdAt");
  return res.json({ users });
});

router.patch("/users/:id/role", requireAuth, requireRole("admin"), async (req, res) => {
  const { role } = req.body;
  if (!["alumni", "student", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select("name email role");
  if (!user) return res.status(404).json({ message: "Not found" });
  return res.json({ user, message: `User promoted to ${role}` });
});

router.delete("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "Not found" });
  return res.json({ success: true, message: `User ${user.email} deleted` });
});

export default router;
