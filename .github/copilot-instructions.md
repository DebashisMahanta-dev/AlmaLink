# AlmaLink - Project Setup & Development Guide

## Project Completion Checklist

- [x] **Verify copilot-instructions.md** - File created in .github directory
- [x] **Clarify Project Requirements** - Full-stack alumni networking app with job posting, resume uploads, admin approval workflow
- [x] **Scaffold Project** - React (Vite) + Node/Express + MongoDB architecture implemented
- [x] **Customize Features** - JWT auth, RBAC, alumni directory, job posting/applications, messaging, admin controls
- [x] **Install Extensions** - No extensions required for this project type
- [x] **Compile Project** - Dependencies installed, no errors
- [ ] **Create and Run Task** - Run both servers in separate terminals (see below)
- [ ] **Launch Project** - Start servers and access the application
- [x] **Finalize Documentation** - README.md and setup instructions complete

## Quick Start

### Prerequisites

- Node.js v16+
- MongoDB (MongoDB Community or Atlas)

### 1. Start Backend Server

```bash
cd server
npm run seed        # Create admin user (one-time)
npm run dev         # Start on http://localhost:5000
```

**Default Admin Credentials:**

- Email: `admin@almalink.local`
- Password: `ChangeMe123!` (change immediately after first login)

### 2. Start Frontend Server (in new terminal)

```bash
cd client
npm run dev         # Start on http://localhost:5173
```

### 3. Access the Application

Open **http://localhost:5173** in your browser.

## Project Structure

```
server/              # Express backend with MongoDB
  ├── src/
  │   ├── models/    # User, Job, Application, Message schemas
  │   ├── routes/    # API endpoints
  │   ├── middleware/# Auth, roles, file upload, error handling
  │   ├── config/    # Database configuration
  │   ├── seed/      # Database seeding script
  │   └── index.js   # Server entry point

client/              # React + Vite frontend
  ├── src/
  │   ├── pages/     # Login, Register, Dashboard
  │   ├── components/# Reusable UI components
  │   ├── context/   # AuthContext for auth state
  │   ├── services/  # API client (axios)
  │   └── App.jsx    # Main app with routing
```

## Technology Stack

| Layer       | Technology                            |
| ----------- | ------------------------------------- |
| Frontend    | React 18 + Vite + Bootstrap 5 + Axios |
| Backend     | Node.js + Express                     |
| Database    | MongoDB                               |
| Auth        | JWT (7-day expiry) + bcryptjs         |
| File Upload | Multer (PDF only, 2MB max)            |

## Core Features Implemented

### Authentication & Authorization

- ✅ Email/password registration and login
- ✅ JWT-based authentication (7-day tokens)
- ✅ Role-based access control (alumni, student, admin)
- ✅ Password hashing with bcryptjs

### Alumni Management

- ✅ Alumni registration with profile (company, location, branch, graduation year)
- ✅ Admin approval workflow for new alumni
- ✅ Searchable alumni directory (filters: year, branch, location, company, name)

### Job Management

- ✅ Alumni can post job/internship opportunities
- ✅ Job expiry dates support
- ✅ Students can view available jobs
- ✅ Students can apply with resume upload (PDF, max 2MB)
- ✅ Application status tracking
- ✅ Alumni can view applications for their posted jobs

### Communication

- ✅ In-app messaging between users
- ✅ Message history/inbox view

### Admin Dashboard

- ✅ View pending alumni approvals
- ✅ Approve/reject alumni registrations
- ✅ Delete inappropriate job postings

## API Reference

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current authenticated user

### Alumni Directory

- `GET /api/alumni?year=2020&branch=CS&location=NYC` - List alumni with filters

### Jobs

- `GET /api/jobs` - Get active job postings
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Post new job (alumni only)
- `POST /api/jobs/:id/apply` - Apply with resume (student only)
- `GET /api/jobs/:id/applications` - View applications (alumni only)
- `GET /api/jobs/me/applications` - View student's applications

### Admin

- `GET /api/admin/pending-alumni` - List unapproved alumni
- `PATCH /api/admin/approve/:id` - Approve alumni registration
- `DELETE /api/admin/jobs/:id` - Delete job posting

### Messaging

- `POST /api/messages` - Send message
- `GET /api/messages/inbox` - Get user's messages

## Environment Configuration

### Server (.env)

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/almalink
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@almalink.local
ADMIN_PASSWORD=ChangeMe123!
NODE_ENV=development
```

Change these values for production deployment.

## Development Workflow

### Running Both Servers

**Option 1: Separate Terminals**

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

**Option 2: From Root (if using monorepo scripts)**

```bash
npm run dev:server  # Terminal 1
npm run dev:client  # Terminal 2
```

### File Upload Testing

1. Register as Student
2. View available jobs
3. Click Apply for a job
4. Upload a PDF resume (max 2MB)
5. Submit application
6. Login as the alumni who posted the job to see applications

### Admin Approval Workflow

1. Register new Alumni account
2. Login as Admin
3. Go to pending approvals section
4. Approve the alumni registration
5. Alumni can now post jobs

## Common Troubleshooting

**Issue**: "Cannot connect to MongoDB"

- **Solution**: Ensure MongoDB is running (`mongod` on Windows)
- Or update `.env` with MongoDB Atlas connection string

**Issue**: CORS error accessing frontend

- **Solution**: Verify `CLIENT_URL` in server `.env` matches frontend URL

**Issue**: Resume upload fails

- **Solution**: Check file is PDF format, under 2MB, and `server/uploads/resumes/` directory exists

**Issue**: Admin user not found after seed

- **Solution**: Verify MongoDB connection, then run `npm run seed` again

**Issue**: Ports already in use

- **Solution**: Change PORT in `.env` or kill processes using ports 5000 and 5173

## Security Notes

- ✅ Passwords are hashed before storage
- ✅ JWT tokens included in Authorization header for API requests
- ✅ CORS configured to only accept requests from CLIENT_URL
- ✅ Admin endpoints require authentication and admin role
- ✅ Resume files validated (PDF only, size limit)
- ✅ Alumni must be approved by admin before posting jobs

**Important**: Change default admin password immediately after first login.

## Future Enhancement Ideas

- Real-time notifications with Socket.io
- GitHub profile OAuth integration
- Admin analytics dashboard (Chart.js/Recharts)
- Event RSVP and calendar integration
- Alumni donation/fundraising module
- Email notifications for applications
- Advanced search and filtering
- Alumni success stories blog

## Deployment Considerations

### Backend Deployment (Heroku, AWS, etc.)

1. Add production environment variables
2. Set `NODE_ENV=production`
3. Use MongoDB Atlas instead of local MongoDB
4. Set strong JWT_SECRET
5. Deploy to platform and update CLIENT_URL

### Frontend Deployment (Vercel, Netlify, AWS)

1. Build: `npm run build`
2. Deploy `dist/` folder
3. Configure environment variables for API URL
4. Set up CI/CD pipeline

## Support

For issues or questions:

1. Check the Troubleshooting section above
2. Review README.md for detailed documentation
3. Verify all environment variables are set correctly
4. Check server logs for detailed error messages
5. Ensure both servers are running on correct ports

---

**Project Status**: Development Ready ✅  
**Last Updated**: February 2026  
**Stack**: MERN-style (React, Express, MongoDB, Node)
