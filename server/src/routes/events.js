import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { Event } from "../models/Event.js";
import { sendEventRegistrationEmail } from "../services/emailService.js";

const router = express.Router();

const mapEventForUser = (eventDoc, user) => {
  const event = eventDoc.toObject();
  const registrations = Array.isArray(event.registrations) ? event.registrations : [];
  const myRegistration = registrations.find(
    (entry) =>
      String(entry.user) === String(user._id) ||
      String(entry.email || "").toLowerCase() === String(user.email || "").toLowerCase()
  );

  return {
    ...event,
    attendingCount: registrations.length,
    isRegistered: Boolean(myRegistration),
    myRegistration: myRegistration
      ? {
          fullName: myRegistration.fullName,
          email: myRegistration.email,
          phone: myRegistration.phone,
          note: myRegistration.note,
          registeredAt: myRegistration.registeredAt
        }
      : null,
    registrations: undefined
  };
};

router.get("/", requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ active: true, startsAt: { $gte: new Date() } })
      .sort({ startsAt: 1 })
      .limit(12);
    return res.json({ events: events.map((event) => mapEventForUser(event, req.user)) });
  } catch (err) {
    console.error("Get events error:", err);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
});

router.post("/:id/register", requireAuth, async (req, res) => {
  try {
    const { fullName, email, phone = "", note = "" } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event || !event.active) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (new Date(event.startsAt) < new Date()) {
      return res.status(400).json({ message: "Registration is closed for past events" });
    }

    const normalizedEmail = String(email || req.user.email || "").toLowerCase().trim();
    const normalizedName = String(fullName || req.user.name || "").trim();
    const normalizedPhone = String(phone || "").trim();
    const normalizedNote = String(note || "").trim();

    if (!normalizedName || !normalizedEmail) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const alreadyRegistered = (event.registrations || []).some(
      (entry) =>
        String(entry.user) === String(req.user._id) ||
        String(entry.email || "").toLowerCase() === normalizedEmail
    );

    if (alreadyRegistered) {
      return res.status(409).json({ message: "You are already registered for this event" });
    }

    event.registrations.push({
      user: req.user._id,
      fullName: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      note: normalizedNote
    });
    event.attendingCount = event.registrations.length;
    await event.save();

    await sendEventRegistrationEmail({
      email: normalizedEmail,
      name: normalizedName,
      event
    });

    return res.status(201).json({
      message: "Event registration successful",
      event: mapEventForUser(event, req.user)
    });
  } catch (err) {
    console.error("Event registration error:", err);
    return res.status(500).json({ message: "Failed to register for event" });
  }
});

router.delete("/:id/register", requireAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.active) {
      return res.status(404).json({ message: "Event not found" });
    }

    const existingIndex = (event.registrations || []).findIndex(
      (entry) =>
        String(entry.user) === String(req.user._id) ||
        String(entry.email || "").toLowerCase() === String(req.user.email || "").toLowerCase()
    );

    if (existingIndex < 0) {
      return res.status(404).json({ message: "You are not registered for this event" });
    }

    event.registrations.splice(existingIndex, 1);
    event.attendingCount = event.registrations.length;
    await event.save();

    return res.json({
      message: "Event registration cancelled",
      event: mapEventForUser(event, req.user)
    });
  } catch (err) {
    console.error("Event unregister error:", err);
    return res.status(500).json({ message: "Failed to cancel registration" });
  }
});

router.get("/:id/registrations", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("registrations.user", "name email role");
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.json({
      event: {
        _id: event._id,
        title: event.title,
        startsAt: event.startsAt,
        attendingCount: event.registrations.length
      },
      registrations: event.registrations || []
    });
  } catch (err) {
    console.error("Get event registrations error:", err);
    return res.status(500).json({ message: "Failed to fetch event registrations" });
  }
});

export default router;
