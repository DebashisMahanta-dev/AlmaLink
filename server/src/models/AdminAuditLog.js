import mongoose from "mongoose";

const AdminAuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "approve_alumni",
        "promote_admin",
        "demote_admin",
        "update_user_role",
        "delete_user",
        "delete_job"
      ]
    },
    actor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      email: { type: String, required: true }
    },
    target: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
      email: { type: String },
      role: { type: String }
    },
    details: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

AdminAuditLogSchema.index({ createdAt: -1 });

export const AdminAuditLog = mongoose.model("AdminAuditLog", AdminAuditLogSchema);
