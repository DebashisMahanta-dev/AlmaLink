import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

announcementSchema.index({ createdAt: -1 });

export const Announcement = mongoose.model("Announcement", announcementSchema);
