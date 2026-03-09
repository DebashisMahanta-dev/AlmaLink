## Google OAuth Authentication Troubleshooting Guide

### Step 1: Check Browser Console for Errors

1. Open your browser (Chrome/Firefox)
2. Go to login page: http://localhost:5173/login
3. Press **F12** to open Developer Tools
4. Go to **Console** tab
5. Click "Google" button to attempt login
6. **Copy any error message** and share it

### Step 2: Expected OAuth Flow

```
User clicks "Google" button
  ↓
Redirected to: accounts.google.com/o/oauth2/v2/auth
  ↓
User logs in to Google
  ↓
Redirected back to: http://localhost:5173/auth/google/callback?code=...&state=...
  ↓
Frontend sends code to: POST http://localhost:5000/api/auth/google/callback
  ↓
Backend exchanges code for tokens from Google
  ↓
Backend verifies ID token
  ↓
Response: token (existing user) OR requiresProfileCompletion (new user)
```

### Step 3: Common Error Messages & Solutions

**Error: "Invalid Redirect URI"**

- **Cause**: The redirect_uri in Google OAuth request doesn't match Google Cloud Console
- **Solution**:
  1. Go to https://console.cloud.google.com
  2. Navigate to APIs & Services > Credentials
  3. Click on your OAuth 2.0 Client ID
  4. Under "Authorized redirect URIs", ensure this URI is registered:
     ```
     http://localhost:5173/auth/google/callback
     ```
  5. Save changes and restart server

**Error: "Invalid Client ID" or "Invalid Credentials"**

- **Cause**: Your GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is wrong/expired
- **Solution**:
  1. Go to https://console.cloud.google.com
  2. Go to APIs & Services > Credentials
  3. Delete the old OAuth 2.0 Client ID
  4. Create a new OAuth 2.0 Client ID:
     - Application Type: Web application
     - Authorized redirect URIs:
       - http://localhost:5173/auth/google/callback
       - http://localhost:5173 (for login page itself)
  5. Copy the new Client ID and Secret
  6. Update server/.env:
     ```
     GOOGLE_CLIENT_ID=<new-id>
     GOOGLE_CLIENT_SECRET=<new-secret>
     ```
  7. Update client/.env:
     ```
     VITE_GOOGLE_CLIENT_ID=<new-id>
     ```
  8. Restart both servers

**Error: "Failed to obtain ID token" or "CORS error"**

- **Cause**: Token exchange with Google servers is failing
- **Solution**:
  1. Verify Google OAuth credentials are correct
  2. Ensure your internet connection is working
  3. Try clearing browser cache: Ctrl+Shift+Delete
  4. Check server logs: `npm run dev` should show errors

**Error: "Cannot GET /auth/google/callback"** or "404"

- **Cause**: Frontend route not registered
- **Solution**:
  1. Check client/src/App.jsx has this route:
     ```javascript
     <Route path="/auth/google/callback" element={<GoogleCallback />} />
     ```
  2. Verify GoogleCallback component exists in client/src/pages/GoogleCallback.jsx
  3. Restart frontend: Ctrl+C and run `npm run dev`

### Step 4: Detailed Error Checking

**Check Server Logs:**

```bash
# If server is running with npm run dev, check the terminal output
# Look for messages like:
# - "Google callback error: ..."
# - "Failed to obtain ID token"
# - "Invalid Google token"
```

**Check Network Requests (Browser DevTools):**

1. Open DevTools (F12)
2. Go to Network tab
3. Click Google login
4. Look for POST request to: `http://localhost:5000/api/auth/google/callback`
5. Check the response status and details

### Step 5: Minimal Test

If you're still having issues, try this minimal test:

1. Ensure server is running on port 5000
2. Ensure frontend is running on port 5173
3. Go to: http://localhost:5173/login
4. Right-click > Inspect > Console tab
5. Click "Google" button
6. Share the error message you see in the console

### Step 6: Reset & Reconfiguration (if nothing works)

```bash
# 1. Delete OAuth credentials from Google Cloud Console
# 2. Create new OAuth 2.0 Client Credentials
# 3. Update both .env files
# 4. Restart both servers:

# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev

# 5. Test again at http://localhost:5173/login
```

### Critical Debugging Checklist

- [ ] Google credentials in server/.env
- [ ] Google Client ID in client/.env
- [ ] Redirect URI matches: http://localhost:5173/auth/google/callback
- [ ] Both servers running (port 5000 and 5173)
- [ ] No firewall/antivirus blocking localhost requests
- [ ] Browser cache cleared
- [ ] OAuth 2.0 Client ID created (not OAuth app or service account)
- [ ] Redirect URI registered in Google Cloud Console
