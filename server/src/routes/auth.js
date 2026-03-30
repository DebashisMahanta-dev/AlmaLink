import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { isValidEmail } from "../utils/validators.js";
import { sendWelcomeEmail } from "../services/emailService.js";

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const buildDefaultPhotoUrl = (name = "User") => {
  const safeName = encodeURIComponent(String(name).trim() || "User");
  return `https://ui-avatars.com/api/?name=${safeName}&background=0D8ABC&color=fff&size=256`;
};

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

router.post("/register", async (req, res) => {
  const { name, email, password, photoUrl } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "User already registered" });
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  const role = "student";
  const approved = true;
  
  const normalizedPhotoUrl =
    typeof photoUrl === "string" && photoUrl.trim() ? photoUrl.trim() : buildDefaultPhotoUrl(name);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    approved,
    emailVerified: true,
    onboardingCompleted: false,
    photoUrl: normalizedPhotoUrl,
    verificationOTP: null,
    verificationOTPExpiry: null,
    verificationToken: null,
    verificationTokenExpiry: null,
    studentProfile: {
      graduationYear: "",
      branch: "",
      currentYear: "",
      college: "Government College of Engineering",
      country: ""
    }
  });

  return res.status(201).json({
    message: "Registration successful.",
    token: signToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved,
      onboardingCompleted: user.onboardingCompleted
    }
  });
});

// Development endpoint: Get verification token for testing (only in development)
router.post("/test-verification-otp", async (req, res) => {
  return res.status(410).json({ message: "Email verification is temporarily disabled" });
});

// Verify Email
// Verify Email with OTP
router.post("/verify-otp", async (req, res) => {
  return res.status(410).json({ message: "Email verification is temporarily disabled" });
});

// Verify Email with Token (backward compatibility)
router.post("/verify-email", async (req, res) => {
  return res.status(410).json({ message: "Email verification is temporarily disabled" });
});

// Resend Verification Email with OTP
router.post("/resend-verification", async (req, res) => {
  return res.status(410).json({ message: "Email verification is temporarily disabled" });
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
  
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  return res.json({
    token: signToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved,
      onboardingCompleted: user.onboardingCompleted
    }
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
    const email = payload.email;
    const name = payload.name;

    // Find existing user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // New user must complete profile first (role + skills)
      const tempData = {
        email: email.toLowerCase(),
        name: name || "Google User",
        timestamp: Date.now()
      };
      const tempToken = jwt.sign(tempData, process.env.JWT_SECRET, { expiresIn: "15m" });

      return res.json({
        requiresProfileCompletion: true,
        tempToken,
        email: email.toLowerCase(),
        name: name || "Google User"
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
        emailVerified: true,
        onboardingCompleted: false,
        photoUrl: buildDefaultPhotoUrl(name),
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
        approved: user.approved,
        onboardingCompleted: user.onboardingCompleted
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
        emailVerified: true,
        onboardingCompleted: false,
        photoUrl: buildDefaultPhotoUrl(name),
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
        approved: user.approved,
        onboardingCompleted: user.onboardingCompleted
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
    const {
      tempToken,
      role,
      country,
      graduationYear,
      branch,
      currentYear,
      college,
      employmentStatus,
      company,
      location,
      skills,
      projects,
      achievements,
      photoUrl
    } = req.body;

    if (!tempToken || !role || !country || !graduationYear || !branch || !Array.isArray(skills)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["alumni", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const normalizedSkills = skills
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, 30);

    if (normalizedSkills.length === 0) {
      return res.status(400).json({ message: "Please add at least one skill" });
    }

    const normalizedProjects = Array.isArray(projects)
      ? projects.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 20)
      : [];

    const normalizedAchievements = Array.isArray(achievements)
      ? achievements.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 20)
      : [];

    if (role === "student") {
      if (!currentYear || !college) {
        return res.status(400).json({ message: "Current study year and college are required for students" });
      }
      if (normalizedProjects.length === 0) {
        return res.status(400).json({ message: "Please add at least one project" });
      }
      if (normalizedAchievements.length === 0) {
        return res.status(400).json({ message: "Please add at least one achievement" });
      }
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
      approved,
      emailVerified: true,
      onboardingCompleted: false,
      photoUrl: typeof photoUrl === "string" && photoUrl.trim() ? photoUrl.trim() : buildDefaultPhotoUrl(name),
      skills: normalizedSkills,
      projects: normalizedProjects,
      achievements: normalizedAchievements
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
        branch,
        currentYear,
        college,
        country
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
        approved: user.approved,
        onboardingCompleted: user.onboardingCompleted
      }
    });
  } catch (err) {
    console.error("Google profile completion error:", err.message);
    return res.status(500).json({ message: "Profile completion failed" });
  }
});

export default router;
