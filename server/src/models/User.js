import mongoose from "mongoose";

const AlumniProfileSchema = new mongoose.Schema(
  {
    graduationYear: String,
    branch: String,
    company: String,
    location: String,
    contact: String
  },
  { _id: false }
);

const StudentProfileSchema = new mongoose.Schema(
  {
    graduationYear: String,
    branch: String,
    currentYear: String,
    college: String,
    country: String
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["alumni", "student", "admin"], required: true },
    approved: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    mentorshipOptIn: { type: Boolean, default: false },
    mentorshipStatus: {
      type: String,
      enum: ["not_enrolled", "pending", "approved", "rejected"],
      default: "not_enrolled"
    },
    mentorshipRequestedAt: { type: Date, default: null },
    mentorshipReviewedAt: { type: Date, default: null },
    verificationOTP: { type: String, default: null }, // 6-digit OTP
    verificationOTPExpiry: { type: Date, default: null }, // OTP expires in 10 minutes
    verificationToken: { type: String, default: null }, // Legacy token for backward compatibility
    verificationTokenExpiry: { type: Date, default: null },
    photoUrl: { type: String, default: "" },
    bannerUrl: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    onboardingCompleted: { type: Boolean, default: true },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    projects: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    resumeUrl: { type: String, default: "" },
    alumniProfile: AlumniProfileSchema,
    studentProfile: StudentProfileSchema
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
