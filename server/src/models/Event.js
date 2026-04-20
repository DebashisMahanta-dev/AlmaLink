import mongoose from "mongoose";

const EventRegistrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "", trim: true },
    note: { type: String, default: "", trim: true },
    registeredAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    startsAt: { type: Date, required: true },
    location: { type: String, default: "" },
    format: { type: String, default: "Online" },
    attendingCount: { type: Number, default: 0 },
    registrations: { type: [EventRegistrationSchema], default: [] },
    rsvpLabel: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", EventSchema);
