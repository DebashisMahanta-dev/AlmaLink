import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { Announcement } from "../models/Announcement.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.json({ announcements });
  } catch (err) {
    console.error("Failed to load announcements:", err);
    return res.status(500).json({ message: "Failed to load announcements" });
  }
});

router.get("/admin/all", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.json({ announcements });
  } catch (err) {
    console.error("Failed to load admin announcements:", err);
    return res.status(500).json({ message: "Failed to load announcements" });
  }
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      createdBy: req.user._id
    });

    const saved = await Announcement.findById(announcement._id).populate("createdBy", "name email");
    return res.status(201).json({ message: "Announcement created", announcement: saved });
  } catch (err) {
    console.error("Failed to create announcement:", err);
    return res.status(500).json({ message: "Failed to create announcement" });
  }
});

router.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { title, content, isActive } = req.body;
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (typeof title === "string" && title.trim()) {
      announcement.title = title.trim();
    }
    if (typeof content === "string" && content.trim()) {
      announcement.content = content.trim();
    }
    if (typeof isActive === "boolean") {
      announcement.isActive = isActive;
    }

    await announcement.save();
    const updated = await Announcement.findById(announcement._id).populate("createdBy", "name email");
    return res.json({ message: "Announcement updated", announcement: updated });
  } catch (err) {
    console.error("Failed to update announcement:", err);
    return res.status(500).json({ message: "Failed to update announcement" });
  }
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    return res.json({ message: "Announcement deleted" });
  } catch (err) {
    console.error("Failed to delete announcement:", err);
    return res.status(500).json({ message: "Failed to delete announcement" });
  }
});

export default router;
