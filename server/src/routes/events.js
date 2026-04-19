import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { Event } from "../models/Event.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ active: true, startsAt: { $gte: new Date() } })
      .sort({ startsAt: 1 })
      .limit(12);

    return res.json({ events });
  } catch (err) {
    console.error("Get events error:", err);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
});

export default router;
