# AlmaLink - Web Application

A full-stack alumni networking and job posting platform that bridges the gap between current students and alumni. Alumni can post job/internship opportunities, share experiences, and mentor students. Students can discover career opportunities and connect with alumni.

## Key Features

### User Roles

- **Alumni**: Register, update profile, post job/internship opportunities, share career tips
- **Student**: Browse alumni directory, view and apply for jobs/internships
- **Admin**: Approve alumni registrations, manage content and jobs

### Core Modules

- **User Registration & Login**: Email-based registration with smart role detection based on graduation year + JWT authentication
- **Alumni Directory**: Searchable alumni profiles by graduation year, branch, location, company
- **Job Posting & Application**: Alumni post opportunities; students apply with resume upload (PDF only)
- **Communication**: In-app messaging system between alumni and students
- **Admin Dashboard**: Pending alumni approvals and job content moderation
- **Role-Based Navigation**: Dynamic navbar that changes based on user role with Lucide icons and active page highlighting

## Tech Stack

```
Frontend:   React 18.3 + Vite + Bootstrap 5 + Axios
Backend:    Node.js + Express + MongoDB + JWT + bcryptjs
Storage:    Local file uploads (resume uploads to server)
Database:   MongoDB (local or Atlas)
```

## Quick Start

### Prerequisites

- Node.js v16+
- MongoDB (local or Atlas)
- Git

### Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env: set MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run seed     # Create admin user
npm run dev      # Start server on port 5000
```

### Frontend Setup

```bash
cd client
npm install
npm run dev      # Start client on port 5173
```

### Default Admin Credentials

```
Email: admin@almalink.local
Password: ChangeMe123! (change immediately)
```

## API Endpoints Summary

**Auth**: POST `/api/auth/register`, POST `/api/auth/login`, GET `/api/auth/me`  
**Alumni**: GET `/api/alumni` (searchable)  
**Jobs**: GET `/api/jobs`, POST `/api/jobs`, POST `/api/jobs/:id/apply`, GET `/api/jobs/:id/applications`  
**Admin**: GET `/api/admin/pending-alumni`, PATCH `/api/admin/approve/:id`, DELETE `/api/admin/jobs/:id`  
**Messages**: POST `/api/messages`, GET `/api/messages/inbox`

## Project Structure

```
AlmaLink/
├── server/                      # Express backend
│   ├── src/
│   │   ├── config/              # Database config
│   │   ├── middleware/          # Auth, roles, upload handlers
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # API routes
│   │   ├── seed/                # Database seeding
│   │   ├── utils/               # Validators
│   │   └── index.js             # Main server file
│   ├── uploads/resumes/         # Resume storage
│   ├── .env                     # Environment variables
│   └── package.json
│
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── context/             # AuthContext
│   │   ├── pages/               # Login, Register, Dashboard
│   │   ├── services/            # API client
│   │   ├── App.jsx              # App routing
│   │   └── main.jsx             # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .github/
│   └── copilot-instructions.md
├── package.json                 # Root monorepo config
└── README.md
```

## Navigation Structure

The navbar dynamically changes based on user login status and role, featuring Lucide icons for clarity.

### 🌐 Public Navbar (Not Logged In)

- 🏠 **Home** - Landing page
- ℹ️ **About** - Platform information
- 🔐 **Sign In** - Login page
- 📝 **Join** - Registration page

### 🎓 Student Navbar (After Login)

**Left Navigation:**

- 🏠 Dashboard
- 👨‍🎓 Alumni Directory
- 💼 Jobs

**Right Navigation:**

- 💬 Messages (with unread badge)
- 📄 My Applications
- 👤 Profile (dropdown)
- 🚪 Logout

### 🧑‍💼 Alumni Navbar (After Login)

**Left Navigation:**

- 🏠 Dashboard
- ➕ Post Job
- 💼 My Job Posts
- ✍️ Share Experience

**Right Navigation:**

- 💬 Messages (with unread badge)
- 👤 Profile (dropdown)
- 🚪 Logout

### 🛡️ Admin Navbar (After Login)

**Left Navigation:**

- 🏠 Admin Dashboard
- ✅ Approve Alumni (with pending count badge)
- 💼 Manage Jobs
- 📢 Announcements

**Right Navigation:**

- 👤 Admin Profile (dropdown)
- 🚪 Logout

### Key Features

- ✅ Role-based navigation (Student/Alumni/Admin)
- ✅ Icon-based menu items (Lucide React icons)
- ✅ Message badge with unread count
- ✅ Active page highlighting
- ✅ Mobile-responsive with hamburger menu
- ✅ Smooth dropdown animations
- ✅ Color-coded navbar per role (Blue=Student/Alumni, Green=Alumni, Red=Admin)

## User Workflows

**Student**: Register → Browse alumni & jobs → Apply with resume → Track status  
**Alumni**: Register → Admin approval → Post jobs → Manage applications  
**Admin**: Login → Approve alumni → Moderate jobs

## Smart Role Detection

The registration form intelligently detects and suggests your role based on graduation year:

- **Graduated within last 2 years** → Automatically suggests **Student** role
- **Graduated 3+ years ago** → Automatically suggests **Alumni** role
- **Manual Override** → Users can always change the suggestion

### How It Works

1. Enter your graduation year in the form
2. The system auto-calculates and suggests the appropriate role
3. Confirmation hint appears: "💡 Based on your graduation year, we suggest: [Student/Alumni]"
4. Submit button is enabled only after selecting a role
5. Users can override the suggestion if needed

### Benefits

✅ Faster registration (no manual role selection needed)  
✅ Reduces registration errors  
✅ Better role classification  
✅ Flexible for edge cases (users can override)

## File Upload Requirements

- **Format**: PDF only
- **Max Size**: 2 MB
- **Storage**: AWS S3 (production) or local disk (development)
  - **Local**: Served from `/uploads/resumes/` (default fallback)
  - **AWS S3**: Requires configuration (see [AWS S3 Setup Guide](AWS_S3_SETUP.md))

## Environment Variables

| Variable              | Default                            | Note                              |
| --------------------- | ---------------------------------- | --------------------------------- |
| PORT                  | 5000                               | Backend port                      |
| MONGO_URI             | mongodb://127.0.0.1:27017/almalink | MongoDB connection                |
| JWT_SECRET            | (required)                         | JWT signing secret                |
| CLIENT_URL            | http://localhost:5173              | Frontend URL                      |
| ADMIN_EMAIL           | admin@almalink.local               | Initial admin email               |
| ADMIN_PASSWORD        | ChangeMe123!                       | Initial admin password            |
| AWS_S3_BUCKET         | (optional)                         | S3 bucket name for resume storage |
| AWS_REGION            | us-east-1                          | AWS region for S3 bucket          |
| AWS_ACCESS_KEY_ID     | (optional)                         | AWS access key (if using S3)      |
| AWS_SECRET_ACCESS_KEY | (optional)                         | AWS secret key (if using S3)      |

## Common Issues

**MongoDB Connection Error**: Ensure MongoDB is running (`mongod`)  
**CORS Errors**: Verify CLIENT_URL in .env matches frontend URL  
**Resume Upload Fails**: Check file is PDF, under 2MB, and `/uploads/resumes/` exists  
**Port Already in Use**: Change PORT in .env or kill the process using the port  
**AWS S3 Upload Error**: Verify AWS credentials are set correctly in .env or use local fallback by omitting AWS variables

## Security Features

✅ Hashed passwords (bcryptjs)  
✅ JWT authentication (7-day expiry)  
✅ Role-based access control  
✅ Admin approval workflow  
✅ Resume validation  
✅ CORS protection

## Future Enhancements

- Real-time chat (Socket.io)
- GitHub profile integration
- Admin analytics dashboard
- Event RSVP system
- Alumni donation module
- Email notifications

## Progress Log

- Job Posting (Alumni) - Day 26-27 (Feb 26-27): Designed job schema and created job posting API. (2 days)
- Job Posting (Alumni) - Day 28-29 (Feb 28 - Mar 1): Implemented job expiry logic and alumni dashboard. (2 days)
- Job Posting (Alumni) - Day 30-31 (Mar 2-3): Developed job listing UI and edit/delete functionality. (2 days)

## Contributing & Support

For issues, verify:

1. MongoDB is running and connected
2. Environment variables are set correctly
3. Both servers are running (backend on 5000, frontend on 5173)
4. File structure matches the project layout

---

**Status**: Development Ready | **Last Updated**: February 2026

- Alumni accounts require admin approval before posting jobs.
- Resume files are stored in AWS S3 (if configured) or locally in `server/uploads/resumes/`.
- For AWS S3 configuration, see [AWS S3 Setup Guide](AWS_S3_SETUP.md).
