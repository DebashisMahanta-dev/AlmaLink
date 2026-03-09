import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";

const router = express.Router();

// Get all conversations for current user
router.get("/", requireAuth, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", req.user._id] },
              "$recipient",
              "$sender",
            ],
          },
          lastMessage: { $first: "$content" },
          lastMessageTime: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$recipient", req.user._id] },
                  { $eq: ["$isRead", false] },
                ] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Populate user details
    const populatedConversations = await User.populate(conversations, {
      path: "_id",
      select: "name email alumniProfile studentProfile",
    });

    res.json({ conversations: populatedConversations });
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get conversation with specific user
router.get("/:userId", requireAuth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id },
      ],
    })
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        recipient: req.user._id,
        sender: req.params.userId,
        isRead: false,
      },
      { isRead: true }
    );

    const otherUser = await User.findById(req.params.userId).select(
      "name email alumniProfile studentProfile"
    );

    res.json({ messages, otherUser });
  } catch (err) {
    console.error("Get conversation error:", err);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

// Send a message
router.post("/", requireAuth, async (req, res) => {
  try {
    const { recipient, content } = req.body;

    if (!recipient || !content) {
      return res.status(400).json({ error: "Recipient and content required" });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Verify recipient exists
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient,
      content,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("recipient", "name email");

    res.status(201).json({ message: populatedMessage });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Mark message as read
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    message.isRead = true;
    await message.save();

    res.json({ message });
  } catch (err) {
    console.error("Update message error:", err);
    res.status(500).json({ error: "Failed to update message" });
  }
});

// Delete a message
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete" });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({ message: "Message deleted" });
  } catch (err) {
    console.error("Delete message error:", err);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

export default router;
