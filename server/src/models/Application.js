import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeUrl: { type: String, required: true },
    coverLetter: String,
    status: { type: String, enum: ["submitted", "reviewed", "accepted", "rejected"], default: "submitted" }
  },
  { timestamps: true }
);

export const Application = mongoose.model("Application", ApplicationSchema);
