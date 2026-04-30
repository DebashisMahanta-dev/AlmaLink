import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { Donation } from "../models/Donation.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("donor", "name email role")
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json({ donations });
  } catch (err) {
    console.error("Failed to load donations:", err);
    return res.status(500).json({ message: "Failed to load donations" });
  }
});

router.get("/summary", requireAuth, async (req, res) => {
  try {
    const [summary] = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCount: { $sum: 1 }
        }
      }
    ]);
    return res.json({
      totalAmount: summary?.totalAmount || 0,
      totalCount: summary?.totalCount || 0
    });
  } catch (err) {
    console.error("Failed to load donation summary:", err);
    return res.status(500).json({ message: "Failed to load donation summary" });
  }
});

router.post("/", requireAuth, requireRole("alumni", "admin"), async (req, res) => {
  try {
    const { amount, purpose, note, currency } = req.body;
    const normalizedAmount = Number(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    if (!purpose || !String(purpose).trim()) {
      return res.status(400).json({ message: "Purpose is required" });
    }

    const donation = await Donation.create({
      donor: req.user._id,
      amount: normalizedAmount,
      purpose: String(purpose).trim(),
      note: typeof note === "string" ? note.trim() : "",
      currency: typeof currency === "string" && currency.trim() ? currency.trim().toUpperCase() : "INR",
      status: "pledged"
    });

    const populated = await Donation.findById(donation._id).populate("donor", "name email role");
    return res.status(201).json({ message: "Donation pledge submitted", donation: populated });
  } catch (err) {
    console.error("Failed to create donation:", err);
    return res.status(500).json({ message: "Failed to submit donation pledge" });
  }
});

router.patch("/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pledged", "received"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    donation.status = status;
    await donation.save();

    const updated = await Donation.findById(donation._id).populate("donor", "name email role");
    return res.json({ message: "Donation status updated", donation: updated });
  } catch (err) {
    console.error("Failed to update donation status:", err);
    return res.status(500).json({ message: "Failed to update donation status" });
  }
});

export default router;
