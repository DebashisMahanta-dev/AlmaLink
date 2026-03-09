import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "your-email@gmail.com",
    pass: process.env.SMTP_PASS || "your-app-password"
  }
});

export const sendVerificationEmail = async (email, name, verificationOTP, verificationLink) => {
  const mailOptions = {
    from: process.env.SMTP_USER || "noreply@almalink.com",
    to: email,
    subject: "Your AlmaLink Email Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #94c2c7 0%, #7fa9b0 50%, #4a8a95 100%); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🎓 AlmaLink</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 12px 12px;">
          <h2 style="color: #333; margin-top: 0;">Welcome to AlmaLink, ${name}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for registering with AlmaLink. To verify your email address, use the verification code below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; letter-spacing: 8px; font-size: 32px; font-weight: bold; color: #52b788; font-family: 'Courier New', monospace;">
              ${verificationOTP}
            </div>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;">
            This code will expire in <strong>10 minutes</strong>.
          </p>
          <p style="color: #999; font-size: 14px;">
            Or click the link below to verify directly:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationLink}" style="background-color: #52b788; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Verify Email
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            If you didn't sign up for AlmaLink, you can ignore this email.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.SMTP_USER || "noreply@almalink.com",
    to: email,
    subject: "Welcome to AlmaLink!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #94c2c7 0%, #7fa9b0 50%, #4a8a95 100%); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🎓 AlmaLink</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 12px 12px;">
          <h2 style="color: #333; margin-top: 0;">Welcome, ${name}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your email has been verified! You can now log in and start connecting with alumni and exploring opportunities.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}" style="background-color: #52b788; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Go to AlmaLink
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2026 AlmaLink. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Welcome email sending failed:", error);
    return false;
  }
};
