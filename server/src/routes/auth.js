import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { isValidEmail } from "../utils/validators.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../services/emailService.js";

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

router.post("/register", async (req, res) => {
  const { name, email, password, role, alumniProfile, studentProfile } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  if (!['alumni', 'student'].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "User already registered" });
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  const approved = role === "student";
  
  // Generate 6-digit OTP
  const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  // Generate backup token for link-based verification
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    approved,
    emailVerified: false,
    verificationOTP,
    verificationOTPExpiry,
    verificationToken,
    verificationTokenExpiry,
    alumniProfile: role === "alumni" ? alumniProfile : undefined,
    studentProfile: role === "student" ? studentProfile : undefined
  });
  
  // Send verification email with OTP
  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  const emailSent = await sendVerificationEmail(email, name, verificationOTP, verificationLink);
  
  return res.status(201).json({
    message: "Registration successful. Please verify your email with the OTP sent to your mailbox.",
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    emailSent: emailSent,
    verificationOTPForDevelopment: process.env.NODE_ENV === "development" ? verificationOTP : undefined
  });
});

// Development endpoint: Get verification token for testing (only in development)
router.post("/test-verification-otp", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ message: "This endpoint is only available in development mode" });
  }
  
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Return the current OTP
    if (!user.verificationOTP) {
      return res.status(400).json({ message: "No active OTP. Please register again or request a resend." });
    }

    return res.json({
      email: user.email,
      verificationOTP: user.verificationOTP,
      expiresAt: user.verificationOTPExpiry,
      message: "Use this OTP to verify your email during development. This OTP will expire in 10 minutes."
    });
  } catch (err) {
    console.error("Test verification OTP error:", err.message);
    return res.status(500).json({ message: "Failed to retrieve verification OTP" });
  }
});

// Verify Email
// Verify Email with OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }
  
  const user = await User.findOne({ 
    email: email.toLowerCase(),
    verificationOTP: otp,
    verificationOTPExpiry: { $gt: new Date() }
  });
  
  if (!user) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  
  // Mark email as verified
  user.emailVerified = true;
  user.verificationOTP = null;
  user.verificationOTPExpiry = null;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  await user.save();
  
  // Send welcome email
  await sendWelcomeEmail(user.email, user.name);
  
  return res.json({
    message: "Email verified successfully. You can now login.",
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

// Verify Email with Token (backward compatibility)
router.post("/verify-email", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Verification token required" });
  }
  
  const user = await User.findOne({ 
    verificationToken: token,
    verificationTokenExpiry: { $gt: new Date() }
  });
  
  if (!user) {
    return res.status(400).json({ message: "Invalid or expired verification token" });
  }
  
  // Mark email as verified
  user.emailVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  user.verificationOTP = null;
  user.verificationOTPExpiry = null;
  await user.save();
  
  // Send welcome email
  await sendWelcomeEmail(user.email, user.name);
  
  return res.json({
    message: "Email verified successfully. You can now login.",
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

// Resend Verification Email with OTP
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }
  
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  
  if (user.emailVerified) {
    return res.status(400).json({ message: "Email already verified" });
  }
  
  // Generate new 6-digit OTP
  const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  // Also update backup token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  user.verificationOTP = verificationOTP;
  user.verificationOTPExpiry = verificationOTPExpiry;
  user.verificationToken = verificationToken;
  user.verificationTokenExpiry = verificationTokenExpiry;
  await user.save();
  
  // Send verification email with OTP
  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  const emailSent = await sendVerificationEmail(user.email, user.name, verificationOTP, verificationLink);
  
  if (!emailSent) {
    return res.status(500).json({ message: "Failed to send verification email" });
  }
  
  return res.json({ 
    message: "Verification OTP sent. Please check your inbox.",
    verificationOTPForDevelopment: process.env.NODE_ENV === "development" ? verificationOTP : undefined
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  
  // Check if email is verified
  if (!user.emailVerified) {
    return res.status(403).json({ 
      message: "Please verify your email before logging in", 
      emailNotVerified: true 
    });
  }
  
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  return res.json({
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role, approved: user.approved }
  });
});

router.get("/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

// Google OAuth - Verify ID Token
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Missing ID token" });
    }

    // Verify the ID token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user from Google profile
      const passwordHash = await bcrypt.hash(Math.random().toString(36), 10);
      user = await User.create({
        name: name || "Google User",
        email: email.toLowerCase(),
        passwordHash,
        role: "student", // Default to student
        approved: true, // Auto-approve OAuth signups
        studentProfile: { 
          graduationYear: new Date().getFullYear().toString(), 
          branch: "Not specified" 
        }
      });
    }

    return res.json({
      token: signToken(user._id),
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        approved: user.approved 
      }
    });
  } catch (err) {
    console.error("Google OAuth error:", err.message);
    return res.status(401).json({ message: "Invalid Google token" });
  }
});

// GitHub OAuth - Verify Access Token
router.post("/github", async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: "Missing access token" });
    }

    // Get user profile from GitHub
    const profileResponse = await axios.get(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Accept": "application/vnd.github.v3+json"
        }
      }
    );

    const profileData = profileResponse.data;
    const githubId = profileData.id;
    const name = profileData.name || profileData.login || "GitHub User";

    // Get email from GitHub
    const emailResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Accept": "application/vnd.github.v3+json"
        }
      }
    );

    const emailData = emailResponse.data;
    const emailObj = emailData.find(e => e.primary) || emailData[0];
    const email = emailObj?.email;

    if (!email) {
      return res.status(400).json({ 
        message: "Could not retrieve email from GitHub. Please ensure your email is public on your GitHub profile." 
      });
    }

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user from GitHub profile
      const passwordHash = await bcrypt.hash(Math.random().toString(36), 10);
      user = await User.create({
        name: name,
        email: email.toLowerCase(),
        passwordHash,
        role: "student", // Default to student, can promote to alumni later
        approved: true, // Auto-approve OAuth signups
        studentProfile: { 
          graduationYear: new Date().getFullYear().toString(), 
          branch: "Not specified" 
        }
      });
    }

    return res.json({
      token: signToken(user._id),
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        approved: user.approved 
      }
    });
  } catch (err) {
    console.error("GitHub OAuth error:", err.message);
    return res.status(401).json({ message: "Invalid GitHub token" });
  }
});

// GitHub OAuth Callback - Exchange code for access token
router.post("/github/callback", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Missing authorization code" });
    }

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: `${process.env.CLIENT_URL}/auth/github/callback`
      },
      {
        headers: {
          "Accept": "application/json"
        }
      }
    );

    const { access_token, error } = tokenResponse.data;

    if (error || !access_token) {
      return res.status(401).json({ 
        message: "Failed to obtain access token",
        error: error || "No access token returned"
      });
    }

    // Get user profile from GitHub
    const profileResponse = await axios.get(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Accept": "application/vnd.github.v3+json"
        }
      }
    );

    const profileData = profileResponse.data;
    const name = profileData.name || profileData.login || "GitHub User";

    // Get email from GitHub
    const emailResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Accept": "application/vnd.github.v3+json"
        }
      }
    );

    const emailData = emailResponse.data;
    const emailObj = emailData.find(e => e.primary) || emailData[0];
    const email = emailObj?.email;

    if (!email) {
      return res.status(400).json({ 
        message: "Could not retrieve email from GitHub. Please ensure your email is public on your GitHub profile." 
      });
    }

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const passwordHash = await bcrypt.hash(Math.random().toString(36), 10);
      user = await User.create({
        name: name,
        email: email.toLowerCase(),
        passwordHash,
        role: "student",
        approved: true,
        studentProfile: { 
          graduationYear: new Date().getFullYear().toString(), 
          branch: "Not specified" 
        }
      });
    }

    return res.json({
      token: signToken(user._id),
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        approved: user.approved 
      }
    });
  } catch (err) {
    console.error("GitHub callback error:", err.response?.data || err.message);
    return res.status(401).json({ 
      message: "GitHub authentication failed",
      error: err.response?.data?.error || err.message
    });
  }
});

// Google OAuth Callback - Exchange code for access token
router.post("/google/callback", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Missing authorization code" });
    }

    // Exchange authorization code for tokens
    const params = new URLSearchParams();
    params.append("code", code);
    params.append("client_id", process.env.GOOGLE_CLIENT_ID);
    params.append("client_secret", process.env.GOOGLE_CLIENT_SECRET);
    params.append("redirect_uri", `${process.env.CLIENT_URL}/auth/google/callback`);
    params.append("grant_type", "authorization_code");

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const { id_token, access_token } = tokenResponse.data;

    if (!id_token) {
      return res.status(401).json({ message: "Failed to obtain ID token" });
    }

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // New user - return temporary token for profile completion
      const tempData = {
        email: email.toLowerCase(),
        name,
        timestamp: Date.now()
      };
      const tempToken = jwt.sign(tempData, process.env.JWT_SECRET, { expiresIn: "15m" });
      
      return res.json({
        requiresProfileCompletion: true,
        tempToken,
        email: email.toLowerCase(),
        name
      });
    }

    return res.json({
      token: signToken(user._id),
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        approved: user.approved 
      }
    });
  } catch (err) {
    console.error("Google callback error:", err.response?.data || err.message);
    return res.status(401).json({ 
      message: "Google authentication failed", 
      error: err.response?.data?.error_description || err.message 
    });
  }
});

// Google OAuth Profile Completion
router.post("/google/complete-profile", async (req, res) => {
  try {
    const { tempToken, role, country, graduationYear, branch, employmentStatus, company, location } = req.body;

    if (!tempToken || !role || !country || !graduationYear || !branch) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify temp token
    let tokenData;
    try {
      tokenData = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const { email, name } = tokenData;

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "User already registered" });
    }

    // Create user profile
    const passwordHash = await bcrypt.hash(Math.random().toString(36), 10);
    const approved = role === "student" ? true : false; // Alumni need approval

    const userData = {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      approved
    };

    if (role === "alumni") {
      userData.alumniProfile = {
        graduationYear,
        branch,
        company: employmentStatus === "working" ? company : "",
        location: employmentStatus === "working" ? location : country,
        contact: ""
      };
    } else {
      userData.studentProfile = {
        graduationYear,
        branch
      };
    }

    const user = await User.create(userData);

    return res.json({
      token: signToken(user._id),
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        approved: user.approved 
      }
    });
  } catch (err) {
    console.error("Google profile completion error:", err.message);
    return res.status(500).json({ message: "Profile completion failed" });
  }
});

export default router;
