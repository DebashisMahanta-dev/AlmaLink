import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { User } from "../models/User.js";
import { Job } from "../models/Job.js";
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
