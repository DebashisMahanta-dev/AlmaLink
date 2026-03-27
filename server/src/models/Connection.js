import mongoose from "mongoose";

const ConnectionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending"
    },
    message: {
      type: String,
      default: "I'd like to connect with you"
    }
  },
  { timestamps: true }
);

// Prevent duplicate connection requests
ConnectionSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export const Connection = mongoose.model("Connection", ConnectionSchema);
