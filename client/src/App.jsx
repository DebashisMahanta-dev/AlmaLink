import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AlumniDirectory from "./pages/AlumniDirectory";
import AlumniNetwork from "./pages/AlumniNetwork";
import Jobs from "./pages/Jobs";
import Events from "./pages/Events";
import Messages from "./pages/Messages";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import PostJob from "./pages/PostJob";
import MyJobs from "./pages/MyJobs";
import ShareExperience from "./pages/ShareExperience";
import AdminDashboard from "./pages/AdminDashboard";
import ApproveAlumni from "./pages/ApproveAlumni";
import ManageJobs from "./pages/ManageJobs";
import Announcements from "./pages/Announcements";
import GitHubCallback from "./pages/GitHubCallback";
import GoogleCallback from "./pages/GoogleCallback";
import CompleteGoogleProfile from "./pages/CompleteGoogleProfile";
import VerifyEmail from "./pages/VerifyEmail";
import ViewProfile from "./pages/ViewProfile";
import ConnectionRequests from "./pages/ConnectionRequests";
import JobDetails from "./pages/JobDetails";

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container py-5">Loading...</div>;
  }

  return (
    <div>
      <NavBar />
      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/auth/github/callback" element={<GitHubCallback />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/complete-profile" element={<CompleteGoogleProfile />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Student Routes */}
        <Route path="/alumni" element={user?.role === "student" || user?.role === "alumni" ? <AlumniDirectory /> : <Navigate to="/" />} />
        <Route path="/profile/:id" element={user ? <ViewProfile /> : <Navigate to="/login" />} />
        <Route path="/connections" element={user ? <ConnectionRequests /> : <Navigate to="/login" />} />
        <Route path="/jobs" element={user ? <Jobs /> : <Navigate to="/login" />} />
        <Route path="/jobs/:id" element={user ? <JobDetails /> : <Navigate to="/login" />} />
        <Route path="/events" element={user ? <Events /> : <Navigate to="/login" />} />
        <Route path="/messages" element={user ? <Messages /> : <Navigate to="/login" />} />
        <Route path="/my-applications" element={user?.role === "student" ? <MyApplications /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />

        {/* Alumni Routes */}
        <Route path="/alumni-network" element={user?.role === "alumni" ? <AlumniNetwork /> : <Navigate to="/" />} />
        <Route path="/post-job" element={user?.role === "alumni" ? <PostJob /> : <Navigate to="/" />} />
        <Route path="/my-jobs" element={user?.role === "alumni" ? <MyJobs /> : <Navigate to="/" />} />
        <Route path="/share" element={user?.role === "alumni" ? <ShareExperience /> : <Navigate to="/" />} />

        {/* Admin Routes */}
        <Route path="/admin" element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/approve-alumni" element={user?.role === "admin" ? <ApproveAlumni /> : <Navigate to="/" />} />
        <Route path="/manage-jobs" element={user?.role === "admin" ? <ManageJobs /> : <Navigate to="/" />} />
        <Route path="/announcements" element={user?.role === "admin" ? <Announcements /> : <Navigate to="/" />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
