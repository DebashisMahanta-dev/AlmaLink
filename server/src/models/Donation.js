import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    currency: {
      type: String,
      default: "INR"
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ["pledged", "received"],
      default: "pledged"
    }
  },
  { timestamps: true }
);

donationSchema.index({ createdAt: -1 });

export const Donation = mongoose.model("Donation", donationSchema);
