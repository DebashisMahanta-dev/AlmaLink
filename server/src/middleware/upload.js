import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";
import fs from "fs";

// Check if S3 credentials are available
const useS3 = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET;

let resumeUpload;

if (useS3) {
  // AWS S3 Configuration
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const s3Storage = multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET,
    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedBy: req.user?._id || "anonymous"
      });
    },
    key: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const fileName = `resumes/${unique}${path.extname(file.originalname)}`;
      cb(null, fileName);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  };

  resumeUpload = multer({
    storage: s3Storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
  });
} else {
  // Fallback to Local Storage (for development)
  console.warn("AWS S3 credentials not found. Using local file storage for resume uploads.");
  
  const uploadsDir = path.resolve("uploads", "resumes");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  };

  resumeUpload = multer({
    storage: localStorage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
  });
}

export { resumeUpload };
