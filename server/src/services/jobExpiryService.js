import { Job } from "../models/Job.js";
import { Application } from "../models/Application.js";

const DEFAULT_INTERVAL_MS = 60 * 1000;

export const purgeExpiredJobs = async () => {
  const now = new Date();
  const expiredJobs = await Job.find({ expiryDate: { $lte: now } }).select("_id").lean();

  if (!expiredJobs.length) {
    return { deletedJobs: 0, deletedApplications: 0 };
  }

  const expiredJobIds = expiredJobs.map((job) => job._id);

  const [jobDeletionResult, applicationDeletionResult] = await Promise.all([
    Job.deleteMany({ _id: { $in: expiredJobIds } }),
    Application.deleteMany({ job: { $in: expiredJobIds } })
  ]);

  return {
    deletedJobs: jobDeletionResult.deletedCount ?? 0,
    deletedApplications: applicationDeletionResult.deletedCount ?? 0
  };
};

export const startJobExpiryCleanup = ({ intervalMs = DEFAULT_INTERVAL_MS } = {}) => {
  const runCleanup = async () => {
    try {
      const { deletedJobs, deletedApplications } = await purgeExpiredJobs();
      if (deletedJobs > 0) {
        console.log(
          `[job-expiry] Removed ${deletedJobs} expired job(s) and ${deletedApplications} application(s)`
        );
      }
    } catch (err) {
      console.error("[job-expiry] Failed to purge expired jobs:", err.message);
    }
  };

  // Run once on startup so stale data is removed immediately.
  runCleanup();

  const timer = setInterval(runCleanup, intervalMs);
  if (typeof timer.unref === "function") {
    timer.unref();
  }

  return () => clearInterval(timer);
};
