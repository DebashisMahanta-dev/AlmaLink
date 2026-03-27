import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    type: { type: String, default: "Full-time" },
    description: { type: String, required: true },
    roles: { type: [String], enum: ["freshers", "experienced"], required: true, default: ["freshers", "experienced"] },
    expiryDate: { type: Date },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", JobSchema);
