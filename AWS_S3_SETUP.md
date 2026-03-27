# AWS S3 Resume Upload Setup Guide

## Overview

This guide explains how to set up AWS S3 for resume uploads in AlmaLink. The application supports both **AWS S3 (recommended for production)** and **local file storage (default for development)**.

## Prerequisites

- AWS Account (with S3 access)
- AWS CLI configured (optional but helpful)
- Node.js and npm installed

## Step-by-Step Setup

### 1. Create an S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click **Create bucket**
3. Enter a bucket name (e.g., `almalink-resumes-prod`)
4. Choose region (e.g., us-east-1)
5. **Block Public Access**: Keep enabled for security
6. Click **Create bucket**

### 2. Create IAM User with S3 Access

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Create user**
3. Enter username (e.g., `almalink-app`)
4. Click **Next**
5. Select **Attach policies directly**
6. Search for and select: **AmazonS3FullAccess**
7. Click **Create user**

### 3. Generate Access Keys

1. Click the new user
2. Go to **Security credentials** tab
3. Click **Create access key**
4. Choose **Application running outside AWS**
5. Click **Create access key**
6. **Save the Access Key ID and Secret Access Key** (you won't see the secret again!)

### 4. Configure Environment Variables

Update your `.env` file in the `server/` directory:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
AWS_S3_BUCKET=almalink-resumes-prod
```

### 5. Install AWS SDK Packages

Run in the `server/` directory:

```bash
npm install @aws-sdk/client-s3 multer-s3
```

### 6. Restart the Server

```bash
npm run dev
```

Check the server logs. You should see:

- ✅ If S3 credentials are valid: No warning message
- ⚠️ If S3 credentials are missing: "Using local file storage for resume uploads"

## Testing the Upload

1. **Login as a Student** at http://localhost:5173
2. Go to **Jobs** page
3. Click on a job posting
4. Click **Apply Now**
5. Upload a PDF resume
6. Submit application
7. Check S3 bucket for the uploaded file:
   - Bucket → resumes/ folder
   - Files named like: `1709600000000-123456789.pdf`

## Production Deployment

### Best Practices

1. **Use IAM Role (for EC2/Lambda)**
   - Instead of hardcoding credentials, use EC2 IAM roles
   - Avoids credential exposure in environment variables

2. **Enable Bucket Versioning**
   - Protects against accidental deletions
   - Settings → Versioning → Enable

3. **Set Bucket Lifecycle Policy**
   - Auto-delete old resumes after 90 days (optional)
   - Management → Lifecycle policies

4. **Enable Encryption**
   - Properties → Default Encryption → Enable
   - Use AWS-managed keys (SSE-S3)

5. **CloudFront Distribution (Optional Performance)**
   - Creates a CDN for faster downloads
   - Reduces S3 bandwidth costs

### Cost Estimation (AWS S3)

- **Storage**: ~$0.023 per GB/month
- **Upload requests**: $0.005 per 1000 requests
- **Download requests**: $0.0004 per 1000 requests

For 100 student applications per month with 2MB average resume:

- Storage: ~$0.19/month
- Requests: ~$0.01/month
- **Total**: ~$3/year

## Troubleshooting

### Error: "AWS S3 credentials not found"

- Check `.env` variables are spelled correctly
- Ensure `.env` file is in `server/` directory
- Restart the server after updating `.env`

### Error: "Access Denied" or "Invalid credentials"

- Verify Access Key ID and Secret are correct
- Check IAM user has `AmazonS3FullAccess` policy
- Verify bucket name matches exactly

### Resumes still not uploading?

- Check browser console (F12) for network errors
- Check server logs for detailed error messages
- Ensure resume file is PDF format
- Ensure file size is under 2MB

### Want to go back to local storage?

- Remove AWS\_ variables from `.env`
- Restart server
- Resumes will be saved to `server/uploads/resumes/` again

## API Reference

### Resume Upload Endpoint

**POST** `/api/jobs/:id/apply`

**Request:**

```javascript
const formData = new FormData();
formData.append("resume", pdfFile);
formData.append("coverLetter", "Your cover letter text");

const response = await fetch(`/api/jobs/${jobId}/apply`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

**Response Success (201):**

```json
{
  "application": {
    "_id": "123abc...",
    "job": "job-id...",
    "student": "student-id...",
    "resumeUrl": "https://s3.amazonaws.com/bucket/resumes/...",
    "coverLetter": "...",
    "createdAt": "2026-03-05T..."
  }
}
```

**Response Error:**

```json
{
  "message": "Resume is required" // or other error message
}
```

## Environment Variables Summary

| Variable                | Required | Example                 | Notes                    |
| ----------------------- | -------- | ----------------------- | ------------------------ |
| `AWS_REGION`            | Optional | `us-east-1`             | AWS region for S3 bucket |
| `AWS_ACCESS_KEY_ID`     | Optional | `AKIAIOSFODNN7EXAMPLE`  | IAM user access key      |
| `AWS_SECRET_ACCESS_KEY` | Optional | `wJalrXUtnFEMI/K7MD...` | IAM user secret key      |
| `AWS_S3_BUCKET`         | Optional | `almalink-resumes-prod` | S3 bucket name           |

**All AWS variables are optional.** If not provided, the app uses local file storage.

## Support

For AWS S3 issues, refer to:

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [multer-s3 GitHub](https://github.com/badrap/multer-s3)
