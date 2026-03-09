import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

console.log("🔐 Google OAuth Configuration Check");
console.log("=====================================");
console.log("Client ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing");
console.log("Client Secret:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing");
console.log("Client URL:", process.env.CLIENT_URL);
console.log("Redirect URI:", `${process.env.CLIENT_URL}/auth/google/callback`);
console.log("");

// Test basic configuration
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("❌ ERROR: Google credentials are missing in .env");
  process.exit(1);
}

console.log("✅ All Google OAuth environment variables are configured!");
console.log("");
console.log("⚠️  Next steps:");
console.log("1. Ensure this redirect URI is registered in Google Cloud Console:");
console.log(`   ${process.env.CLIENT_URL}/auth/google/callback`);
console.log("2. Check that Client ID matches in both .env and Google Cloud Console");
console.log("3. If error persists, regenerate Client ID/Secret in Google Cloud Console");
