# Email Verification Setup Guide

## Current Status

Email verification is currently **not configured** on your server. This means users cannot receive verification emails automatically.

## Option 1: Quick Testing (Development/Testing)

If you're in **development mode**, you can use the built-in test feature:

1. **Register a new account** on the application
2. You'll be sent to the **Verify Email** page
3. Click the **"▶ Get Test Code For Development"** button
4. Enter your email address
5. Click **"Get Verification Code"** 
6. The system will automatically verify your email and redirect you to login

This only works if the server is running with `NODE_ENV=development`.

## Option 2: Configure Real Email (Gmail via App Password)

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to [Gmail Security Settings](https://myaccount.google.com/security)
2. Click **"2-Step Verification"** and complete the setup
3. Return to Security settings (refresh the page)

### Step 2: Generate App Password

1. Go back to [Gmail Security Settings](https://myaccount.google.com/security)
2. Scroll down to **"App passwords"** (appears only if 2FA is enabled)
3. Select **Mail** and **Windows Computer** (or your device)
4. Click **"Generate"**
5. Copy the 16-character password provided

### Step 3: Update Server .env File

Add or update these variables in your `server/.env`:

```env
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

Replace:
- `your-email@gmail.com` with your actual Gmail address
- `your-16-char-app-password` with the 16-character password from Step 2 (remove spaces)

### Step 4: Restart Your Backend Server

```bash
cd server
npm run dev
```

### Step 5: Test Email Verification

1. Register a new account with a valid email
2. Check your email inbox for the verification link
3. Click the link or copy the code and paste it in the app

## Option 3: Use Alternative Email Services

If you prefer not to use Gmail, you can configure other SMTP providers:

### Microsoft Outlook
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Troubleshooting

### "Authentication failed" Error

- Verify your SMTP credentials are correct
- Ensure 2FA is enabled on Gmail (required for app passwords)
- Try logging into your email with the provided password
- Check that spaces are removed from app password

### Emails Not Arriving

- Check spam/junk folder
- Wait 5-10 seconds (email delivery takes time)
- Try resending from the verification page
- Check server logs for error messages

### "Email verification is unavailable"

This means either:
- The server is not in development mode AND email is not configured
- There's a network issue connecting to the SMTP server
- The SMTP credentials are invalid

## Production Deployment

For production servers, email verification is **strongly recommended**. Follow Option 2 or Option 3 above with proper credentials.

Never commit `.env` files to version control - use environment variables on your hosting platform (Heroku, AWS, etc.).

## Support

If you're experiencing issues:

1. Check the server logs for error messages
2. Verify all `.env` variables are set correctly
3. Ensure your email provider allows SMTP connections
4. For Gmail, confirm 2FA and app passwords are set up

---

**Last Updated:** February 16, 2026
