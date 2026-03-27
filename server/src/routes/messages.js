import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { Message } from "../models/Message.js";
import { Conversation } from "../models/Conversation.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";
import { emitToUser } from "../socket.js";

const router = express.Router();

const USER_PREVIEW_SELECT = "name email role alumniProfile studentProfile";
const MAX_PAGE_SIZE = 100;

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizePagination = (query) => {
  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "30", 10), 1), MAX_PAGE_SIZE);
  return { page, limit, skip: (page - 1) * limit };
};

const buildParticipantKey = (firstUserId, secondUserId) =>
  [firstUserId.toString(), secondUserId.toString()].sort().join(":");

const buildConversationSummary = (conversation, currentUserId) => {
  const participants = conversation.participants || [];
  const currentId = currentUserId.toString();
  const otherUser = participants.find((user) => user && user._id.toString() !== currentId);

  return {
    conversationId: conversation._id,
    type: conversation.type,
    participants,
    otherUser,
    lastMessage: conversation.lastMessage?.content || "",
    lastMessageTime: conversation.lastMessage?.createdAt || conversation.updatedAt,
    updatedAt: conversation.updatedAt
  };
};

const getOrCreateDirectConversation = async (currentUserId, otherUserId) => {
  const participantKey = buildParticipantKey(currentUserId, otherUserId);
  let conversation = await Conversation.findOne({ participantKey }).populate(
    "participants",
    USER_PREVIEW_SELECT
  );

  if (!conversation) {
    conversation = await Conversation.create({
      type: "direct",
      participants: [currentUserId, otherUserId],
      participantKey,
      createdBy: currentUserId
    });

    conversation = await Conversation.findById(conversation._id).populate("participants", USER_PREVIEW_SELECT);
  }

  return conversation;
};

const sendDirectMessage = async ({ senderId, recipientId, content }) => {
  const conversation = await getOrCreateDirectConversation(senderId, recipientId);
  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    recipient: recipientId,
    content: content.trim(),
    messageType: "text"
  });

  const updatedConversation = await Conversation.findByIdAndUpdate(conversation._id, {
    lastMessage: {
      messageId: message._id,
      sender: senderId,
      content: content.trim(),
      createdAt: message.createdAt
    },
    updatedAt: new Date()
  }, { new: true }).populate("participants", USER_PREVIEW_SELECT);

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name email")
    .populate("recipient", "name email");

  emitToUser(senderId, "message:new", { conversationId: conversation._id, message: populatedMessage });
  emitToUser(recipientId, "message:new", { conversationId: conversation._id, message: populatedMessage });
  emitToUser(senderId, "conversation:updated", {
    conversation: buildConversationSummary(updatedConversation, senderId)
  });
  emitToUser(recipientId, "conversation:updated", {
    conversation: buildConversationSummary(updatedConversation, recipientId)
  });

  return { conversation: updatedConversation, message: populatedMessage };
};

const getConversationByIdForUser = async (conversationId, userId) =>
  Conversation.findOne({ _id: conversationId, participants: userId }).populate("participants", USER_PREVIEW_SELECT);

// -----------------------------
// New chat APIs
// -----------------------------

// List conversation summaries
router.get("/conversations", requireAuth, async (req, res) => {
  try {
    const { page, limit, skip } = normalizePagination(req.query);

    const [conversations, total] = await Promise.all([
      Conversation.find({ participants: req.user._id })
        .populate("participants", USER_PREVIEW_SELECT)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Conversation.countDocuments({ participants: req.user._id })
    ]);

    const items = conversations.map((conversation) =>
      buildConversationSummary(conversation, req.user._id)
    );

    return res.json({
      conversations: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("List conversations error:", err);
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get or create direct conversation with another user
router.post("/conversations/direct/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot create a conversation with yourself" });
    }

    const recipient = await User.findById(userId).select(USER_PREVIEW_SELECT);
    if (!recipient) {
      return res.status(404).json({ error: "User not found" });
    }

    const conversation = await getOrCreateDirectConversation(req.user._id, userId);
    return res.json({ conversation: buildConversationSummary(conversation, req.user._id) });
  } catch (err) {
    console.error("Create direct conversation error:", err);
    return res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Get messages by conversation id
router.get("/conversations/:conversationId/messages", requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }

    const conversation = await getConversationByIdForUser(conversationId, req.user._id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const { page, limit, skip } = normalizePagination(req.query);

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversationId })
        .populate("sender", "name email")
        .populate("recipient", "name email")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversation: conversationId })
    ]);

    const readAt = new Date();
    const readResult = await Message.updateMany(
      {
        conversation: conversationId,
        recipient: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt
      }
    );

    if ((readResult.modifiedCount ?? 0) > 0) {
      const otherParticipant = conversation.participants.find(
        (participant) => participant._id.toString() !== req.user._id.toString()
      );
      if (otherParticipant) {
        emitToUser(otherParticipant._id, "messages:read", {
          conversationId: conversation._id,
          readerId: req.user._id,
          readAt
        });
      }
    }

    return res.json({
      conversation: buildConversationSummary(conversation, req.user._id),
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Get conversation messages error:", err);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send message in a conversation
router.post("/conversations/:conversationId/messages", requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Message content required" });
    }

    const conversation = await getConversationByIdForUser(conversationId, req.user._id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (conversation.type !== "direct") {
      return res.status(400).json({ error: "Only direct conversation sending is supported" });
    }

    const recipient = conversation.participants.find(
      (participant) => participant._id.toString() !== req.user._id.toString()
    );

    if (!recipient) {
      return res.status(400).json({ error: "Conversation recipient not found" });
    }

    const result = await sendDirectMessage({
      senderId: req.user._id,
      recipientId: recipient._id,
      content
    });

    return res.status(201).json({ message: result.message });
  } catch (err) {
    console.error("Send conversation message error:", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

// Mark all incoming messages in a conversation as read
router.patch("/conversations/:conversationId/read", requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }

    const conversation = await getConversationByIdForUser(conversationId, req.user._id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const readAt = new Date();
    const result = await Message.updateMany(
      { conversation: conversationId, recipient: req.user._id, isRead: false },
      { isRead: true, readAt }
    );

    const otherParticipant = conversation.participants.find(
      (participant) => participant._id.toString() !== req.user._id.toString()
    );
    if (otherParticipant) {
      emitToUser(otherParticipant._id, "messages:read", {
        conversationId: conversation._id,
        readerId: req.user._id,
        readAt
      });
    }

    return res.json({ updatedCount: result.modifiedCount ?? 0 });
  } catch (err) {
    console.error("Mark conversation read error:", err);
    return res.status(500).json({ error: "Failed to mark conversation as read" });
  }
});

// -----------------------------
// Backward-compatible legacy APIs
// -----------------------------

// Get all conversations for current user
router.get("/", requireAuth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate("participants", USER_PREVIEW_SELECT)
      .sort({ updatedAt: -1 });

    const enriched = await Promise.all(
      conversations.map(async (conversation) => {
        const summary = buildConversationSummary(conversation, req.user._id);
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          recipient: req.user._id,
          isRead: false
        });

        return {
          _id: summary.otherUser,
          conversationId: conversation._id,
          lastMessage: summary.lastMessage,
          lastMessageTime: summary.lastMessageTime,
          unreadCount
        };
      })
    );

    return res.json({ conversations: enriched });
  } catch (err) {
    console.error("Get conversations error:", err);
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get conversation with specific user
router.get("/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const otherUser = await User.findById(userId).select(USER_PREVIEW_SELECT);
    if (!otherUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const conversation = await getOrCreateDirectConversation(req.user._id, userId);

    const messages = await Message.find({ conversation: conversation._id })
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      {
        conversation: conversation._id,
        recipient: req.user._id,
        isRead: false,
      },
      { isRead: true, readAt: new Date() }
    );

    return res.json({ messages, otherUser, conversationId: conversation._id });
  } catch (err) {
    console.error("Get conversation error:", err);
    return res.status(500).json({ error: "Failed to fetch conversation" });
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

    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    const result = await sendDirectMessage({
      senderId: req.user._id,
      recipientId: recipient,
      content
    });

    return res.status(201).json({ message: result.message, conversationId: result.conversation._id });
  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({ error: "Failed to send message" });
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
    message.readAt = new Date();
    await message.save();

    emitToUser(message.sender, "messages:read", {
      conversationId: message.conversation,
      readerId: req.user._id,
      readAt: message.readAt
    });

    return res.json({ message });
  } catch (err) {
    console.error("Update message error:", err);
    return res.status(500).json({ error: "Failed to update message" });
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

    emitToUser(message.sender, "message:deleted", {
      conversationId: message.conversation,
      messageId: message._id
    });
    emitToUser(message.recipient, "message:deleted", {
      conversationId: message.conversation,
      messageId: message._id
    });

    return res.json({ message: "Message deleted" });
  } catch (err) {
    console.error("Delete message error:", err);
    return res.status(500).json({ error: "Failed to delete message" });
  }
});

export default router;
