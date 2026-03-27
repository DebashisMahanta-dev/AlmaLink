import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct"
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    participantKey: { type: String, index: true, unique: true, sparse: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastMessage: {
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: { type: String, default: "" },
      createdAt: { type: Date }
    }
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1, updatedAt: -1 });
ConversationSchema.index({ "lastMessage.createdAt": -1 });

export const Conversation = mongoose.model("Conversation", ConversationSchema);