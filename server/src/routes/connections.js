import express from "express";
import { Connection } from "../models/Connection.js";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Get all accepted connections for the current user
router.get("/", requireAuth, async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { sender: req.user._id, status: "accepted" },
        { receiver: req.user._id, status: "accepted" }
      ]
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ updatedAt: -1 });

    // Format response to always show the "other" user
    const formattedConnections = connections.map((conn) => ({
      _id: conn._id,
      connectedUser: conn.sender._id.equals(req.user._id) ? conn.receiver : conn.sender,
      connectedAt: conn.updatedAt
    }));

    return res.json({ connections: formattedConnections });
  } catch (err) {
    console.error("Get connections error:", err);
    return res.status(500).json({ message: "Failed to fetch connections" });
  }
});

// Get pending connection requests
router.get("/requests/pending", requireAuth, async (req, res) => {
  try {
    const requests = await Connection.find({
      receiver: req.user._id,
      status: "pending"
    })
      .populate("sender", "name email role alumniProfile studentProfile")
      .sort({ createdAt: -1 });

    return res.json({ requests });
  } catch (err) {
    console.error("Get pending requests error:", err);
    return res.status(500).json({ message: "Failed to fetch requests" });
  }
});

// Get sent connection requests (pending)
router.get("/requests/sent", requireAuth, async (req, res) => {
  try {
    const requests = await Connection.find({
      sender: req.user._id,
      status: "pending"
    })
      .populate("receiver", "name email role alumniProfile studentProfile")
      .sort({ createdAt: -1 });

    return res.json({ requests });
  } catch (err) {
    console.error("Get sent requests error:", err);
    return res.status(500).json({ message: "Failed to fetch sent requests" });
  }
});

// Send a connection request
router.post("/request", requireAuth, async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    if (req.user._id.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send connection request to yourself" });
    }

    // Check if user exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already connected or request exists
    const existing = await Connection.findOne({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id }
      ]
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(400).json({ message: "Already connected with this user" });
      }
      if (existing.status === "pending") {
        return res.status(400).json({ message: "Connection request already sent" });
      }
      if (existing.status === "rejected") {
        return res.status(400).json({ message: "Cannot send request to this user" });
      }
    }

    // Create new connection request
    const connection = await Connection.create({
      sender: req.user._id,
      receiver: receiverId,
      message: message || "I'd like to connect with you"
    });

    const populatedConnection = await connection.populate("receiver", "name email");

    return res.status(201).json({
      message: "Connection request sent",
      connection: populatedConnection
    });
  } catch (err) {
    console.error("Send connection request error:", err);
    return res.status(500).json({ message: "Failed to send connection request" });
  }
});

// Accept a connection request
router.patch("/request/:id/accept", requireAuth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (!connection.receiver.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to accept this request" });
    }

    if (connection.status !== "pending") {
      return res.status(400).json({ message: "Connection request is no longer pending" });
    }

    connection.status = "accepted";
    await connection.save();

    const populatedConnection = await connection.populate("sender", "name email");

    return res.json({
      message: "Connection request accepted",
      connection: populatedConnection
    });
  } catch (err) {
    console.error("Accept connection error:", err);
    return res.status(500).json({ message: "Failed to accept connection request" });
  }
});

// Reject a connection request
router.patch("/request/:id/reject", requireAuth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (!connection.receiver.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to reject this request" });
    }

    if (connection.status !== "pending") {
      return res.status(400).json({ message: "Connection request is no longer pending" });
    }

    connection.status = "rejected";
    await connection.save();

    return res.json({ message: "Connection request rejected" });
  } catch (err) {
    console.error("Reject connection error:", err);
    return res.status(500).json({ message: "Failed to reject connection request" });
  }
});

// Delete/Cancel a connection request (sender only)
router.delete("/request/:id", requireAuth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (!connection.sender.equals(req.user._id)) {
      return res.status(403).json({ message: "Only sender can cancel connection request" });
    }

    await Connection.deleteOne({ _id: req.params.id });

    return res.json({ message: "Connection request cancelled" });
  } catch (err) {
    console.error("Cancel connection error:", err);
    return res.status(500).json({ message: "Failed to cancel connection request" });
  }
});

export default router;
