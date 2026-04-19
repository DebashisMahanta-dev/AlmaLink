import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    startsAt: { type: Date, required: true },
    location: { type: String, default: "" },
    format: { type: String, default: "Online" },
    attendingCount: { type: Number, default: 0 },
    rsvpLabel: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", EventSchema);
