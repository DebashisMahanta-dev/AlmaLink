import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import alumniRoutes from "./routes/alumni.js";
import jobRoutes from "./routes/jobs.js";
import adminRoutes from "./routes/admin.js";
import messageRoutes from "./routes/messages.js";
import postRoutes from "./routes/posts.js";
import connectionRoutes from "./routes/connections.js";
import eventRoutes from "./routes/events.js";
import profileRoutes from "./routes/profile.js";
import { startJobExpiryCleanup } from "./services/jobExpiryService.js";
import { errorHandler } from "./middleware/error.js";
import { initSocketServer } from "./socket.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const ALLOWED_ORIGINS = [CLIENT_URL, "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json({ limit: "25mb" }));
app.use(morgan("dev"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/profile", profileRoutes);

app.use(errorHandler);

connectDb()
  .then(() => {
    initSocketServer({ httpServer, allowedOrigins: ALLOWED_ORIGINS });
    startJobExpiryCleanup();
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect DB", err);
    process.exit(1);
  });
