import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { User } from "../models/User.js";
import { Job } from "../models/Job.js";
import { Event } from "../models/Event.js";
import Post from "../models/Post.js";
import { Application } from "../models/Application.js";
import { Connection } from "../models/Connection.js";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { AdminAuditLog } from "../models/AdminAuditLog.js";

const router = express.Router();

const getEmailDomain = (email = "") => {
  const parts = email.toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : "";
};

const parseCsvEnv = (value) =>
  (value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const canPromoteToAdmin = (email) => {
  const allowedDomains = parseCsvEnv(process.env.ADMIN_ALLOWED_EMAIL_DOMAINS);
  const allowedEmails = parseCsvEnv(process.env.ADMIN_ALLOWED_EMAILS);

  // Strict mode: promotion policy must be configured for official-staff control.
  if (!allowedDomains.length && !allowedEmails.length) {
    return {
      allowed: false,
      reason:
        "Admin promotion policy is not configured. Set ADMIN_ALLOWED_EMAIL_DOMAINS or ADMIN_ALLOWED_EMAILS in server .env."
    };
  }

  const normalizedEmail = (email || "").toLowerCase();
  const domain = getEmailDomain(normalizedEmail);
  if (allowedEmails.includes(normalizedEmail) || allowedDomains.includes(domain)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: "Only authorized official staff emails can be promoted to admin."
  };
};

const ensureNotRemovingLastAdmin = async (targetUser, requestedRole) => {
  const isAdminDemotion = targetUser.role === "admin" && requestedRole !== "admin";
  if (!isAdminDemotion) {
    return { ok: true };
  }

  const adminCount = await User.countDocuments({ role: "admin" });
  if (adminCount <= 1) {
    return { ok: false, reason: "Cannot demote the last remaining admin." };
  }
  return { ok: true };
};

const createDayKeys = (days) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    };
  });
};

const buildDailySeries = async (model, days, match = {}, dateField = "createdAt") => {
  const dayKeys = createDayKeys(days);
  const start = new Date(dayKeys[0].key);
  const raw = await model.aggregate([
    {
      $match: {
        ...match,
        [dateField]: { $gte: start }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: `$${dateField}`
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  const counts = new Map(raw.map((entry) => [entry._id, entry.count]));
  return dayKeys.map((day) => ({
    ...day,
    count: counts.get(day.key) || 0
  }));
};

const writeAuditLog = async ({ action, actor, target = {}, details = "" }) => {
  try {
    await AdminAuditLog.create({
      action,
      actor: {
        id: actor._id,
        name: actor.name,
        email: actor.email
      },
      target,
      details
    });
  } catch (err) {
    // Avoid failing primary admin actions because of log-write failures.
    console.error("[admin-audit] Failed to write audit log:", err.message);
  }
};

router.get("/pending-alumni", requireAuth, requireRole("admin"), async (req, res) => {
  const alumni = await User.find({ role: "alumni", approved: false }).select("name email alumniProfile");
  return res.json({ alumni });
});

router.get("/pending-mentorship", requireAuth, requireRole("admin"), async (req, res) => {
  const alumni = await User.find({
    role: "alumni",
    approved: true,
    mentorshipOptIn: true,
    mentorshipStatus: "pending"
  }).select("name email alumniProfile mentorshipRequestedAt mentorshipStatus");

  return res.json({ alumni });
});

router.get("/analytics", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const now = new Date();
    const inFourteenDays = new Date(now);
    inFourteenDays.setDate(inFourteenDays.getDate() + 14);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const [
      totalUsers,
      totalAdmins,
      totalAlumni,
      totalStudents,
      approvedAlumni,
      pendingAlumni,
      recentUsers30d,
      totalJobs,
      activeJobs,
      expiringSoonJobs,
      recentJobs30d,
      totalEvents,
      activeEvents,
      upcomingEvents,
      recentEvents30d,
      totalApplications,
      submittedApplications,
      reviewedApplications,
      acceptedApplications,
      rejectedApplications,
      applicationsTrend30d,
      totalPosts,
      postsTrend30d,
      totalMessages,
      unreadMessages,
      totalConversations,
      totalConnections,
      acceptedConnections,
      postsEngagement,
      usersTrend30d,
      recentAuditLogs
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "alumni" }),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "alumni", approved: true }),
      User.countDocuments({ role: "alumni", approved: false }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Job.countDocuments(),
      Job.countDocuments({
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: null },
          { expiryDate: { $gte: now } }
        ]
      }),
      Job.countDocuments({
        expiryDate: { $gte: now, $lte: inFourteenDays }
      }),
      buildDailySeries(Job, 30),
      Event.countDocuments(),
      Event.countDocuments({ active: true }),
      Event.countDocuments({ startsAt: { $gte: now } }),
      buildDailySeries(Event, 30),
      Application.countDocuments(),
      Application.countDocuments({ status: "submitted" }),
      Application.countDocuments({ status: "reviewed" }),
      Application.countDocuments({ status: "accepted" }),
      Application.countDocuments({ status: "rejected" }),
      buildDailySeries(Application, 30),
      Post.countDocuments(),
      buildDailySeries(Post, 30),
      Message.countDocuments(),
      Message.countDocuments({ isRead: false }),
      Conversation.countDocuments(),
      Connection.countDocuments(),
      Connection.countDocuments({ status: "accepted" }),
      Post.aggregate([
        {
          $project: {
            likesCount: { $size: { $ifNull: ["$likes", []] } },
            commentsCount: { $size: { $ifNull: ["$comments", []] } }
          }
        },
        {
          $group: {
            _id: null,
            totalLikes: { $sum: "$likesCount" },
            totalComments: { $sum: "$commentsCount" }
          }
        }
      ]),
      buildDailySeries(User, 30),
      AdminAuditLog.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select("action actor target details createdAt")
    ]);

    const [messageTrend, approvalTrend, connectionTrend] = await Promise.all([
      buildDailySeries(Message, 30),
      buildDailySeries(AdminAuditLog, 30, { action: "approve_alumni" }),
      buildDailySeries(Connection, 30)
    ]);

    const [signups7d, jobs7d, applications7d, messages7d, posts7d, approvals7d, connections7d] =
      await Promise.all([
        buildDailySeries(User, 7),
        buildDailySeries(Job, 7),
        buildDailySeries(Application, 7),
        buildDailySeries(Message, 7),
        buildDailySeries(Post, 7),
        buildDailySeries(AdminAuditLog, 7, { action: "approve_alumni" }),
        buildDailySeries(Connection, 7)
      ]);

    const [recentPostAuthors, recentMessageSenders, recentApplicants, recentConnectionSenders, recentConnectionReceivers] =
      await Promise.all([
        Post.distinct("author", { createdAt: { $gte: thirtyDaysAgo } }),
        Message.distinct("sender", { createdAt: { $gte: thirtyDaysAgo } }),
        Application.distinct("student", { createdAt: { $gte: thirtyDaysAgo } }),
        Connection.distinct("sender", { createdAt: { $gte: thirtyDaysAgo } }),
        Connection.distinct("receiver", { createdAt: { $gte: thirtyDaysAgo } })
      ]);

    const recentUserIds = new Set(
      [
        ...recentPostAuthors,
        ...recentMessageSenders,
        ...recentApplicants,
        ...recentConnectionSenders,
        ...recentConnectionReceivers
      ].map((id) => id.toString())
    );

    const engagementTotals = postsEngagement[0] || { totalLikes: 0, totalComments: 0 };
    const approvalRate = totalAlumni > 0 ? Math.round((approvedAlumni / totalAlumni) * 100) : 0;
    const activeJobsRate = totalJobs > 0 ? Math.round((activeJobs / totalJobs) * 100) : 0;
    const acceptedConnectionRate = totalConnections > 0 ? Math.round((acceptedConnections / totalConnections) * 100) : 0;

    return res.json({
      overview: {
        totalUsers,
        totalAdmins,
        totalAlumni,
        totalStudents,
        approvedAlumni,
        pendingAlumni,
        recentUsers30d,
        approvalRate,
        totalJobs,
        activeJobs,
        activeJobsRate,
        expiringSoonJobs,
        totalEvents,
        activeEvents,
        upcomingEvents,
        totalApplications,
        submittedApplications,
        reviewedApplications,
        acceptedApplications,
        rejectedApplications,
        totalPosts,
        totalMessages,
        unreadMessages,
        totalConversations,
        totalConnections,
        acceptedConnections,
        acceptedConnectionRate,
        totalLikes: engagementTotals.totalLikes || 0,
        totalComments: engagementTotals.totalComments || 0,
        activeUsers30d: recentUserIds.size
      },
      trends: {
        users: usersTrend30d,
        signups7d,
        jobs7d,
        applications7d,
        messages7d,
        posts7d,
        approvals7d,
        connections7d,
        approvals30d: approvalTrend,
        jobs30d: recentJobs30d,
        events30d: recentEvents30d,
        applications30d: applicationsTrend30d,
        posts30d: postsTrend30d,
        messages30d: messageTrend,
        connections30d: connectionTrend
      },
      recent: {
        auditLogs: recentAuditLogs
      }
    });
  } catch (err) {
    console.error("Admin analytics fetch error:", err);
    return res.status(500).json({ message: "Failed to load admin analytics" });
  }
});

router.patch("/approve/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: "alumni" },
    { approved: true },
    { new: true }
  ).select("name email role approved");
  if (!user) return res.status(404).json({ message: "Not found" });

  await writeAuditLog({
    action: "approve_alumni",
    actor: req.user,
    target: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    details: "Alumni account approved"
  });

  return res.json({ user });
});

router.patch("/approve-mentorship/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const user = await User.findOneAndUpdate(
    {
      _id: req.params.id,
      role: "alumni",
      approved: true,
      mentorshipOptIn: true,
      mentorshipStatus: "pending"
    },
    {
      mentorshipStatus: "approved",
      mentorshipReviewedAt: new Date()
    },
    { new: true }
  ).select("name email role mentorshipStatus mentorshipReviewedAt");

  if (!user) return res.status(404).json({ message: "Pending mentorship request not found" });

  await writeAuditLog({
    action: "approve_mentorship",
    actor: req.user,
    target: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    details: "Mentorship enrollment approved"
  });

  return res.json({ message: "Mentorship request approved", user });
});

router.patch("/reject-mentorship/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const user = await User.findOneAndUpdate(
    {
      _id: req.params.id,
      role: "alumni",
      approved: true,
      mentorshipOptIn: true,
      mentorshipStatus: "pending"
    },
    {
      mentorshipStatus: "rejected",
      mentorshipReviewedAt: new Date()
    },
    { new: true }
  ).select("name email role mentorshipStatus mentorshipReviewedAt");

  if (!user) return res.status(404).json({ message: "Pending mentorship request not found" });

  await writeAuditLog({
    action: "reject_mentorship",
    actor: req.user,
    target: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    details: "Mentorship enrollment rejected"
  });

  return res.json({ message: "Mentorship request rejected", user });
});

router.delete("/jobs/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) return res.status(404).json({ message: "Not found" });

  await writeAuditLog({
    action: "delete_job",
    actor: req.user,
    details: `Deleted job \"${job.title}\" (${job._id}) posted by ${job.company}`
  });

  return res.json({ success: true });
});

router.get("/jobs", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("postedBy", "name email photoUrl alumniProfile")
      .sort({ createdAt: -1 });

    return res.json({ jobs });
  } catch (err) {
    console.error("Admin jobs fetch error:", err);
    return res.status(500).json({ message: "Failed to fetch job posts" });
  }
});

router.get("/events", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const events = await Event.find().sort({ startsAt: 1, createdAt: -1 });
    return res.json({ events });
  } catch (err) {
    console.error("Admin events fetch error:", err);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
});

router.post("/events", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const {
      title,
      startsAt,
      location = "",
      format = "Online",
      attendingCount = 0,
      rsvpLabel = "",
      imageUrl = "",
      active = true
    } = req.body;

    if (!title?.trim() || !startsAt) {
      return res.status(400).json({ message: "Title and start time are required" });
    }

    const parsedStartsAt = new Date(startsAt);
    if (Number.isNaN(parsedStartsAt.getTime())) {
      return res.status(400).json({ message: "Invalid event date/time" });
    }

    const event = await Event.create({
      title: title.trim(),
      startsAt: parsedStartsAt,
      location: location.trim(),
      format: format.trim() || "Online",
      attendingCount: Number(attendingCount) || 0,
      rsvpLabel: rsvpLabel.trim(),
      imageUrl: imageUrl.trim(),
      active: Boolean(active)
    });

    await writeAuditLog({
      action: "create_event",
      actor: req.user,
      target: {
        id: event._id,
        name: event.title
      },
      details: `Created event "${event.title}"`
    });

    return res.status(201).json({ event });
  } catch (err) {
    console.error("Admin events create error:", err);
    return res.status(500).json({ message: "Failed to create event" });
  }
});

router.patch("/events/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Not found" });
    }

    const {
      title,
      startsAt,
      location,
      format,
      attendingCount,
      rsvpLabel,
      imageUrl,
      active
    } = req.body;

    if (title !== undefined) event.title = title.trim();
    if (startsAt) {
      const parsedStartsAt = new Date(startsAt);
      if (Number.isNaN(parsedStartsAt.getTime())) {
        return res.status(400).json({ message: "Invalid event date/time" });
      }
      event.startsAt = parsedStartsAt;
    }
    if (location !== undefined) event.location = location.trim();
    if (format !== undefined) event.format = format.trim();
    if (attendingCount !== undefined) event.attendingCount = Number(attendingCount) || 0;
    if (rsvpLabel !== undefined) event.rsvpLabel = rsvpLabel.trim();
    if (imageUrl !== undefined) event.imageUrl = imageUrl.trim();
    if (active !== undefined) event.active = Boolean(active);

    if (!event.title?.trim() || !event.startsAt) {
      return res.status(400).json({ message: "Title and start time are required" });
    }

    await event.save();

    await writeAuditLog({
      action: "update_event",
      actor: req.user,
      target: {
        id: event._id,
        name: event.title
      },
      details: `Updated event "${event.title}"`
    });

    return res.json({ event });
  } catch (err) {
    console.error("Admin events update error:", err);
    return res.status(500).json({ message: "Failed to update event" });
  }
});

router.delete("/events/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Not found" });
    }

    await writeAuditLog({
      action: "delete_event",
      actor: req.user,
      target: {
        id: event._id,
        name: event.title
      },
      details: `Deleted event "${event.title}"`
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Admin events delete error:", err);
    return res.status(500).json({ message: "Failed to delete event" });
  }
});

// Admin Management
router.get("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const users = await User.find().select("name email role approved createdAt");
  return res.json({ users });
});

router.get("/audit-logs", requireAuth, requireRole("admin"), async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "30", 10), 100);
  const logs = await AdminAuditLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("action actor target details createdAt");
  return res.json({ logs });
});

router.patch("/users/:id/role", requireAuth, requireRole("admin"), async (req, res) => {
  const { role } = req.body;
  if (!["alumni", "student", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const targetUser = await User.findById(req.params.id).select("name email role");
  if (!targetUser) {
    return res.status(404).json({ message: "Not found" });
  }

  const currentAdminId = req.user._id.toString();
  const targetUserId = targetUser._id.toString();
  if (currentAdminId === targetUserId && role !== "admin") {
    return res.status(400).json({ message: "You cannot remove your own admin role." });
  }

  if (role === "admin") {
    const promotionPolicy = canPromoteToAdmin(targetUser.email);
    if (!promotionPolicy.allowed) {
      return res.status(403).json({ message: promotionPolicy.reason });
    }
  }

  const demotionCheck = await ensureNotRemovingLastAdmin(targetUser, role);
  if (!demotionCheck.ok) {
    return res.status(400).json({ message: demotionCheck.reason });
  }

  const previousRole = targetUser.role;
  targetUser.role = role;
  await targetUser.save();

  let action = "update_user_role";
  if (previousRole !== "admin" && role === "admin") {
    action = "promote_admin";
  } else if (previousRole === "admin" && role !== "admin") {
    action = "demote_admin";
  }

  await writeAuditLog({
    action,
    actor: req.user,
    target: {
      id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role
    },
    details: `Role changed from ${previousRole} to ${role}`
  });

  return res.json({
    user: targetUser,
    message: role === "admin" ? "User promoted to admin" : `User role updated to ${role}`
  });
});

router.delete("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const targetUser = await User.findById(req.params.id).select("email role");
  if (!targetUser) {
    return res.status(404).json({ message: "Not found" });
  }

  const currentAdminId = req.user._id.toString();
  const targetUserId = targetUser._id.toString();
  if (currentAdminId === targetUserId) {
    return res.status(400).json({ message: "You cannot delete your own account from this panel." });
  }

  if (targetUser.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return res.status(400).json({ message: "Cannot delete the last remaining admin." });
    }
  }

  await User.findByIdAndDelete(req.params.id);

  await writeAuditLog({
    action: "delete_user",
    actor: req.user,
    target: {
      id: targetUser._id,
      email: targetUser.email,
      role: targetUser.role
    },
    details: "User account deleted"
  });

  return res.json({ success: true, message: `User ${targetUser.email} deleted` });
});

export default router;
