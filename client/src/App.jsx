import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import Landing from "./pages/Landing";
import AuthEntry from "./pages/AuthEntry";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
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
import ManageEvents from "./pages/ManageEvents";
import Announcements from "./pages/Announcements";
import GitHubCallback from "./pages/GitHubCallback";
import GoogleCallback from "./pages/GoogleCallback";
import CompleteGoogleProfile from "./pages/CompleteGoogleProfile";
import VerifyEmail from "./pages/VerifyEmail";
import ViewProfile from "./pages/ViewProfile";
import ConnectionRequests from "./pages/ConnectionRequests";
import JobDetails from "./pages/JobDetails";
import Onboarding from "./pages/Onboarding";

const App = () => {
  const { user, loading } = useAuth();
  const needsOnboarding = user?.onboardingCompleted === false;

  const protectRoute = (element) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    if (needsOnboarding) {
      return <Navigate to="/onboarding" />;
    }
    return element;
  };

  if (loading) {
    return <div className="container py-5">Loading...</div>;
  }

  return (
    <div>
      <NavBar />
      <Routes>
        <Route path="/" element={user ? (needsOnboarding ? <Navigate to="/onboarding" /> : <Dashboard />) : <Landing />} />
        <Route path="/dashboard" element={protectRoute(<Dashboard />)} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/login" element={user ? <Navigate to={needsOnboarding ? "/onboarding" : "/dashboard"} /> : <AuthEntry mode="login" />} />
        <Route path="/register" element={user ? <Navigate to={needsOnboarding ? "/onboarding" : "/dashboard"} /> : <AuthEntry mode="register" />} />
        <Route path="/onboarding" element={user ? <Onboarding /> : <Navigate to="/login" />} />
        <Route path="/auth/github/callback" element={<GitHubCallback />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/complete-profile" element={<CompleteGoogleProfile />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Student Routes */}
        <Route path="/alumni" element={user?.role === "student" || user?.role === "alumni" ? protectRoute(<AlumniDirectory />) : <Navigate to="/" />} />
        <Route path="/profile/:id" element={protectRoute(<ViewProfile />)} />
        <Route path="/connections" element={protectRoute(<ConnectionRequests />)} />
        <Route path="/jobs" element={protectRoute(<Jobs />)} />
        <Route path="/jobs/:id" element={protectRoute(<JobDetails />)} />
        <Route path="/events" element={protectRoute(<Events />)} />
        <Route path="/messages" element={protectRoute(<Messages />)} />
        <Route path="/my-applications" element={user?.role === "student" ? protectRoute(<MyApplications />) : <Navigate to="/" />} />
        <Route path="/profile" element={protectRoute(<Profile />)} />

        {/* Alumni Routes */}
        <Route path="/alumni-network" element={user?.role === "alumni" ? protectRoute(<AlumniNetwork />) : <Navigate to="/" />} />
        <Route path="/post-job" element={user?.role === "alumni" ? protectRoute(<PostJob />) : <Navigate to="/" />} />
        <Route path="/my-jobs" element={user?.role === "alumni" ? protectRoute(<MyJobs />) : <Navigate to="/" />} />
        <Route path="/share" element={user?.role === "alumni" ? protectRoute(<ShareExperience />) : <Navigate to="/" />} />

        {/* Admin Routes */}
        <Route path="/admin" element={user?.role === "admin" ? protectRoute(<AdminDashboard />) : <Navigate to="/" />} />
        <Route path="/admin/analytics" element={user?.role === "admin" ? protectRoute(<AdminDashboard />) : <Navigate to="/" />} />
        <Route path="/approve-alumni" element={user?.role === "admin" ? protectRoute(<ApproveAlumni />) : <Navigate to="/" />} />
        <Route path="/manage-jobs" element={user?.role === "admin" ? protectRoute(<ManageJobs />) : <Navigate to="/" />} />
        <Route path="/manage-events" element={user?.role === "admin" ? protectRoute(<ManageEvents />) : <Navigate to="/" />} />
        <Route path="/announcements" element={user?.role === "admin" ? protectRoute(<Announcements />) : <Navigate to="/" />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
