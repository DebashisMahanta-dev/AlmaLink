import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Briefcase,
  Users,
  Calendar,
  MessageSquare,
  Home,
  Settings,
  LogOut,
  Clock,
  MapPin,
  ExternalLink,
  UserRound,
  BriefcaseBusiness,
  CalendarDays,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Send
} from "lucide-react";
import CreatePostModal from "../components/CreatePostModal";
import PostCard from "../components/PostCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [sidebarEvents, setSidebarEvents] = useState([]);
  const [sidebarConnections, setSidebarConnections] = useState([]);
  const [sidebarMentors, setSidebarMentors] = useState([]);
  const [sidebarPendingRequests, setSidebarPendingRequests] = useState({});

  const effectiveUser = profile || user;
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    effectiveUser?.name || "User"
  )}&background=0D8ABC&color=fff&size=256`;
  const avatarUrl = effectiveUser?.photoUrl || defaultAvatar;
  const hasCustomPhoto = Boolean(effectiveUser?.photoUrl) && !effectiveUser.photoUrl.includes("ui-avatars.com");
  const hasSkills = Array.isArray(effectiveUser?.skills) && effectiveUser.skills.length > 0;
  const hasInterests = Array.isArray(effectiveUser?.interests) && effectiveUser.interests.length > 0;
  const hasBio = Boolean(effectiveUser?.bio?.trim());
  const hasProjects = Array.isArray(effectiveUser?.projects) && effectiveUser.projects.length > 0;

  const profileChecks = [
    { label: "Profile photo", done: hasCustomPhoto },
    { label: "Skills", done: hasSkills },
    { label: "Interests", done: hasInterests },
    { label: "Bio", done: hasBio },
    { label: "Projects", done: hasProjects }
  ];

  const completedCount = profileChecks.filter((item) => item.done).length;
  const totalChecks = profileChecks.length;
  const progressPercent = Math.round((completedCount / totalChecks) * 100);
  const missingItems = profileChecks.filter((item) => !item.done).map((item) => item.label);
  const showProgressBanner = missingItems.length > 0;

  useEffect(() => {
    loadJobs();
    loadRecommendedJobs();
    loadPosts();
    loadProfile();
    loadSidebarData();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/profile/me");
      setProfile(res.data.user || null);
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  const loadJobs = async () => {
    try {
      const res = await api.get("/jobs");
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Failed to load jobs", err);
    }
  };

  const loadPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error("Failed to load posts", err);
    }
  };

  const loadRecommendedJobs = async () => {
    if (user?.role !== "student") {
      setRecommendedJobs([]);
      return;
    }

    try {
      const res = await api.get("/jobs/recommended");
      setRecommendedJobs(res.data.recommendedJobs || []);
    } catch (err) {
      console.error("Failed to load recommended jobs", err);
      setRecommendedJobs([]);
    }
  };

  const loadSidebarData = async () => {
    try {
      const [eventsRes, connectionsRes, alumniRes] = await Promise.all([
        api.get("/events"),
        api.get("/connections"),
        api.get("/alumni")
      ]);

      const liveEvents = eventsRes.data.events || [];
      const liveConnections = connectionsRes.data.connections || [];
      const liveAlumni = alumniRes.data.alumni || [];
      const currentUserId = effectiveUser?._id || effectiveUser?.id || user?._id || user?.id;

      const connectionIds = new Set(
        liveConnections.map((item) => item.connectedUser?._id).filter(Boolean)
      );

      const suggestedAlumni = liveAlumni.filter((alum) => {
        const alumId = alum._id?.toString?.() || alum._id;
        return alumId && alumId !== currentUserId && !connectionIds.has(alumId);
      });

      const mentorCandidates = suggestedAlumni
        .filter((alum) => Boolean(alum.alumniProfile?.company))
        .slice(0, 2);

      setSidebarEvents(liveEvents);
      setSidebarConnections(liveConnections.slice(0, 3));
      setSidebarMentors(mentorCandidates.length > 0 ? mentorCandidates : suggestedAlumni.slice(0, 2));
    } catch (err) {
      console.error("Failed to load sidebar data", err);
      setSidebarEvents([]);
      setSidebarConnections([]);
      setSidebarMentors([]);
    }
  };

  const sendSidebarConnectionRequest = async (receiverId) => {
    try {
      await api.post("/connections/request", {
        receiverId,
        message: "Let's connect within the GCE community!"
      });
      setSidebarPendingRequests((prev) => ({ ...prev, [receiverId]: true }));
      toast.success("Connection request sent!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send connection request");
    }
  };

  const handleCreatePost = async (content, images = []) => {
    try {
      const res = await api.post("/posts", { content, images });
      setPosts([res.data.post, ...posts]);
    } catch (err) {
      console.error("Failed to create post", err);
      throw err;
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? res.data.post : p));
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  const handleCommentPost = async (postId, text) => {
    try {
      const res = await api.post(`/posts/${postId}/comment`, { text });
      setPosts(posts.map(p => p._id === postId ? res.data.post : p));
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  const handleEditPost = async (postId, content) => {
    try {
      const res = await api.patch(`/posts/${postId}`, { content });
      setPosts(posts.map(p => p._id === postId ? res.data.post : p));
    } catch (err) {
      console.error("Failed to edit post", err);
      toast.error("Failed to edit post");
      throw err;
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      console.error("Failed to delete post", err);
      toast.error("Failed to delete post");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const graduationYear =
    effectiveUser?.alumniProfile?.graduationYear ||
    effectiveUser?.studentProfile?.graduationYear ||
    effectiveUser?.graduationYear;

  const classLabel = graduationYear ? `Class of ${graduationYear}` : "View Profile";
  const messagesUnreadCount = 3;
  const isActiveItem = (path, hash = "") => {
    if (hash) {
      return location.pathname === path && location.hash === hash;
    }

    return location.pathname === path;
  };

  return (
    <div className="dashboard-shell">
      <div className="dashboard-layout">
        {/* Left Sidebar */}
        <aside className="dashboard-sidebar">
          <Link to="/profile" className="dashboard-profile-card text-decoration-none">
            <img
              src={avatarUrl}
              alt={effectiveUser?.name}
              className="dashboard-profile-avatar"
            />
            <div className="dashboard-profile-meta">
              <div className="dashboard-profile-name">{effectiveUser?.name}</div>
              <div className="dashboard-profile-subtitle">{classLabel}</div>
            </div>
          </Link>

          <div className="dashboard-sidebar-section">
            <div className="dashboard-sidebar-heading">NAVIGATION</div>
            <nav className="dashboard-sidebar-nav">
              <Link to="/dashboard" className={`dashboard-sidebar-link ${isActiveItem("/dashboard") ? "is-active" : ""}`}>
                <Home size={18} />
                <span>Dashboard</span>
              </Link>
              <Link to="/profile" className={`dashboard-sidebar-link ${isActiveItem("/profile") ? "is-active" : ""}`}>
                <UserRound size={18} />
                <span>Profile</span>
              </Link>
              <Link to="/messages" className={`dashboard-sidebar-link ${isActiveItem("/messages") ? "is-active" : ""}`}>
                <MessageSquare size={18} />
                <span>Messages</span>
                <span className="dashboard-badge">{messagesUnreadCount}</span>
              </Link>
              <a href="#posts" className={`dashboard-sidebar-link ${isActiveItem("/", "#posts") ? "is-active" : ""}`}>
                <MessageSquare size={18} />
                <span>My Posts</span>
              </a>
            </nav>
          </div>

          <div className="dashboard-sidebar-section">
            <div className="dashboard-sidebar-heading">EXPLORE</div>
            <nav className="dashboard-sidebar-nav">
              <Link to="/jobs" className={`dashboard-sidebar-link ${isActiveItem("/jobs") ? "is-active" : ""}`}>
                <BriefcaseBusiness size={18} />
                <span>Jobs</span>
              </Link>
              <Link to="/events" className={`dashboard-sidebar-link ${isActiveItem("/events") ? "is-active" : ""}`}>
                <CalendarDays size={18} />
                <span>Events</span>
              </Link>
              <Link to="/alumni" className={`dashboard-sidebar-link ${isActiveItem("/alumni") ? "is-active" : ""}`}>
                <Users size={18} />
                <span>Connections</span>
              </Link>
              <Link to="/alumni-network" className={`dashboard-sidebar-link ${isActiveItem("/alumni-network") ? "is-active" : ""}`}>
                <Briefcase size={18} />
                <span>Mentorship</span>
              </Link>
            </nav>
          </div>

          <div className="dashboard-sidebar-section dashboard-sidebar-section--account">
            <div className="dashboard-sidebar-heading">ACCOUNT</div>
            <nav className="dashboard-sidebar-nav">
              <Link to="/profile" className={`dashboard-sidebar-link ${isActiveItem("/profile") ? "is-active" : ""}`}>
                <Settings size={18} />
                <span>Settings</span>
              </Link>
              <button onClick={handleLogout} className="dashboard-sidebar-link dashboard-sidebar-link--logout" type="button">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: "30px 20px" }}>
          {user?.role === "alumni" && !user?.approved && (
            <div
              className="mb-4 rounded-4 p-4 d-flex justify-content-between align-items-start gap-3"
              style={{
                background: "linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(251, 191, 36, 0.12))",
                border: "1px solid rgba(245, 158, 11, 0.25)"
              }}
            >
              <div className="d-flex gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 48, height: 48, background: "#fff3c4", color: "#b45309" }}
                >
                  <Sparkles size={22} />
                </div>
                <div>
                  <h5 className="fw-bold mb-1">Account pending approval</h5>
                  <p className="mb-0 text-muted">
                    Your alumni account is waiting for admin approval. Once approved, you can post jobs and access alumni tools.
                  </p>
                </div>
              </div>
              <Link to="/profile" className="btn btn-warning rounded-pill px-4 fw-semibold">
                Review Profile
              </Link>
            </div>
          )}

          {showProgressBanner && (
            <div
              className="mb-4 rounded-4 p-4 d-flex justify-content-between align-items-center gap-3"
              style={{
                background: "linear-gradient(135deg, rgba(217, 244, 255, 0.95), rgba(237, 248, 255, 0.95))",
                border: "1px solid rgba(59, 130, 246, 0.18)"
              }}
            >
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 48, height: 48, background: "#fff", color: "#2563eb", boxShadow: "0 8px 20px rgba(37, 99, 235, 0.10)" }}
                >
                  <Sparkles size={22} />
                </div>
                <div>
                  <div className="fw-bold mb-1" style={{ fontSize: "1.05rem" }}>
                    Profile completion: {progressPercent}%
                  </div>
                  <div className="text-muted small">
                    Missing: {missingItems.join(", ")}
                  </div>
                </div>
              </div>
              <Link to="/profile" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2">
                Complete Profile
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          <div
            className="rounded-4 p-4 p-md-5 mb-4 position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 52%, #eef6ff 100%)",
              border: "1px solid #dbeafe",
              boxShadow: "0 18px 40px rgba(14, 30, 37, 0.06)"
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "auto -40px -30px auto",
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)"
              }}
            />
            <div className="position-relative">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <span className="badge rounded-pill px-3 py-2 text-bg-primary-subtle text-primary border border-primary-subtle">
                  {effectiveUser?.role === "alumni" ? "Alumni workspace" : "Student workspace"}
                </span>
                <span className="badge rounded-pill px-3 py-2 text-bg-light text-secondary border">
                  {jobs.length} jobs
                </span>
                <span className="badge rounded-pill px-3 py-2 text-bg-light text-secondary border">
                  {posts.length} posts
                </span>
              </div>

              <h1 className="fw-bold mb-3" style={{ fontSize: "clamp(2rem, 4vw, 3.1rem)", letterSpacing: "-0.03em" }}>
                Welcome back, {effectiveUser?.name?.split(" ")[0]}!
              </h1>
              <p className="text-muted mb-4" style={{ maxWidth: "46rem", fontSize: "1.05rem" }}>
                Unlock opportunities, mentorship, and grow your network with a cleaner, faster GCE Connect experience.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                <button
                  className="btn btn-primary btn-lg rounded-pill px-4 fw-semibold d-inline-flex align-items-center gap-2"
                  onClick={() => navigate("/jobs")}
                  type="button"
                >
                  <BriefcaseBusiness size={18} />
                  Find Opportunities
                </button>
                <button
                  className="btn btn-outline-primary btn-lg rounded-pill px-4 fw-semibold d-inline-flex align-items-center gap-2"
                  onClick={() => setShowCreatePost(true)}
                  type="button"
                >
                  <PlusCircle size={18} />
                  Share Experience
                </button>
              </div>

              <div className="row g-3">
                {[
                  { label: "Events", value: sidebarEvents.length, icon: CalendarDays },
                  { label: "Connections", value: sidebarConnections.length, icon: Users },
                  { label: "Jobs", value: jobs.length, icon: BriefcaseBusiness },
                  { label: "Updates", value: posts.length, icon: MessageSquare }
                ].map((item) => (
                  <div key={item.label} className="col-6 col-lg-3">
                    <div className="rounded-4 p-3 h-100" style={{ background: "#fff", border: "1px solid #e5eefc" }}>
                      <div className="d-flex align-items-center gap-2 text-muted mb-2">
                        <item.icon size={16} />
                        <span className="small fw-semibold">{item.label}</span>
                      </div>
                      <div className="fw-bold" style={{ fontSize: "1.6rem", lineHeight: 1 }}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="rounded-4 p-3 p-md-4 mb-4"
            style={{
              background: "#fff",
              border: "1px solid #e3e8ef",
              boxShadow: "0 10px 24px rgba(14, 30, 37, 0.05)"
            }}
          >
            <div className="d-flex gap-3 align-items-center">
              <img
                src={avatarUrl}
                alt={effectiveUser?.name}
                className="rounded-circle"
                style={{ width: 52, height: 52, objectFit: "cover", border: "2px solid #e8eefc" }}
              />
              <button
                type="button"
                className="form-control text-start rounded-pill shadow-none d-flex align-items-center px-4"
                onClick={() => setShowCreatePost(true)}
                style={{
                  height: "56px",
                  background: "#f8fbff",
                  border: "1px solid #d8e4f5",
                  color: "#6b7280",
                  fontSize: "1rem"
                }}
              >
                <MessageSquare size={18} className="me-2 text-primary" />
                Create a new post...
              </button>
              <button
                className="btn btn-primary rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 56, height: 56 }}
                type="button"
                onClick={() => setShowCreatePost(true)}
                aria-label="Create post"
              >
                <PlusCircle size={20} />
              </button>
            </div>
          </div>

          <div id="posts">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
              <div>
                <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  Alumni Stories & Updates
                </h5>
                <p className="text-muted small mb-0">Fresh posts from alumni and students across the community.</p>
              </div>
              <button className="btn btn-outline-secondary rounded-pill px-3" type="button" onClick={() => setShowCreatePost(true)}>
                <Send size={16} className="me-2" />
                New Post
              </button>
            </div>
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUser={user}
                  onLike={handleLikePost}
                  onComment={handleCommentPost}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                />
              ))
            ) : (
              <div className="rounded-4 p-5 text-center" style={{ background: "#fff", border: "1px solid #e3e8ef" }}>
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ width: 72, height: 72, background: "#f2f6ff", color: "#94a3b8" }}
                >
                  <MessageSquare size={34} />
                </div>
                <h5 className="fw-semibold mb-2">No posts yet. Create one!</h5>
                <p className="text-muted mb-0">Start a conversation, share an update, or post a success story.</p>
              </div>
            )}
          </div>

          {user?.role === "student" && (
            <div
              className="rounded-4 p-4 mb-4"
              style={{
                background: "linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%)",
                border: "1px solid #dbeafe",
                boxShadow: "0 12px 28px rgba(14, 30, 37, 0.05)"
              }}
            >
              <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                <div>
                  <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
                    <Sparkles size={18} className="text-primary" />
                    Recommended Jobs For You
                  </h5>
                  <p className="text-muted small mb-0">
                    Matches based on the skills in your profile.
                  </p>
                </div>
                <Link to="/jobs" className="text-decoration-none fw-semibold">
                  View all
                </Link>
              </div>

              {recommendedJobs.length > 0 ? (
                <div className="row g-3">
                  {recommendedJobs.slice(0, 3).map((job) => (
                    <div key={job._id} className="col-md-4">
                      <div className="rounded-4 p-3 h-100" style={{ background: "#fff", border: "1px solid #e3e8ef" }}>
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                          <div>
                            <h6 className="fw-bold mb-1" style={{ fontSize: "1.02rem" }}>{job.title}</h6>
                            <p className="mb-1 text-muted">{job.company}</p>
                            <small className="text-muted d-flex align-items-center gap-1">
                              <MapPin size={14} /> {job.location || "Remote"}
                            </small>
                          </div>
                          <span className="badge rounded-pill text-bg-success-subtle text-success">
                            {job.matchScore || 0}%
                          </span>
                        </div>

                        {job.matchedSkills?.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mb-3">
                            {job.matchedSkills.slice(0, 3).map((skill) => (
                              <span key={skill} className="badge text-bg-light border text-secondary">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="mb-3 text-muted small">{job.description?.substring(0, 110)}...</p>
                        <button
                          className="btn btn-outline-primary rounded-pill btn-sm px-3"
                          onClick={() => navigate(`/jobs/${job._id}`)}
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-4 p-4 text-center" style={{ background: "#fff", border: "1px dashed #dbeafe" }}>
                  <p className="text-muted mb-0">Add a few skills in your profile to unlock job recommendations.</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-5">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <BriefcaseBusiness size={18} className="text-primary" />
                Recent Job Postings
              </h5>
              <Link to="/jobs" className="text-decoration-none fw-semibold">
                View all
              </Link>
            </div>
            <div style={{ display: "grid", gap: "20px" }}>
              {jobs.length > 0 ? (
                jobs.slice(0, 5).map((job) => (
                  <div
                    key={job._id}
                    className="rounded-4 p-4"
                    style={{ background: "#fff", border: "1px solid #e3e8ef", boxShadow: "0 10px 24px rgba(14, 30, 37, 0.04)" }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2 gap-3">
                      <div>
                        <h6 className="fw-bold mb-1" style={{ fontSize: "1.05rem" }}>{job.title}</h6>
                        <p className="mb-1 text-muted">{job.company}</p>
                        <small className="text-muted d-flex align-items-center gap-1">
                          <MapPin size={14} /> {job.location}
                        </small>
                      </div>
                      <button className="btn btn-link text-primary p-0" onClick={() => navigate(`/jobs/${job._id}`)} aria-label="Open job details">
                        <ExternalLink size={20} />
                      </button>
                    </div>
                    <p className="mb-3 text-muted small">{job.description?.substring(0, 120)}...</p>
                    <button className="btn btn-outline-primary rounded-pill btn-sm px-3" onClick={() => navigate(`/jobs/${job._id}`)}>
                      View details
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-4 p-5 text-center" style={{ background: "#fff", border: "1px solid #e3e8ef" }}>
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: 72, height: 72, background: "#f2f6ff", color: "#94a3b8" }}
                  >
                    <Briefcase size={34} />
                  </div>
                  <h5 className="fw-semibold mb-2">No jobs available</h5>
                  <p className="text-muted mb-0">Approved alumni can post opportunities here.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside
          style={{
            width: "320px",
            backgroundColor: "#fff",
            borderLeft: "1px solid #e8e8e8",
            padding: "18px 16px",
            position: "sticky",
            top: 0,
            height: "calc(100vh - 56px)",
            overflowY: "auto"
          }}
        >
          <div className="mb-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 18, height: 18, background: "#e8eefc", color: "#1d4ed8", fontSize: 12 }}
              >
                {"\uD83D\uDCC5"}
              </span>
              Upcoming Events
            </h6>

            <div className="d-grid gap-3">
              {sidebarEvents.length > 0 ? (
                sidebarEvents.map((event) => {
                  const startsAt = new Date(event.startsAt);
                  const day = startsAt.toLocaleDateString(undefined, { day: "2-digit" });
                  const month = startsAt.toLocaleDateString(undefined, { month: "short" }).toUpperCase();
                  const time = startsAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
                  const chip = event.rsvpLabel || event.format || "Event";
                  const chipClass = event.rsvpLabel === "RSVP Open"
                    ? "bg-success-subtle text-success"
                    : event.rsvpLabel === "Free"
                      ? "bg-info-subtle text-info"
                      : "bg-primary-subtle text-primary";

                  return (
                    <div
                      key={event._id}
                      className="rounded-4 p-3"
                      style={{
                        background: "#fff",
                        border: "1px solid #e3e7ee",
                        boxShadow: "0 1px 0 rgba(0,0,0,0.02)"
                      }}
                    >
                      <div className="d-flex gap-3 align-items-start">
                        <div
                          className="rounded-4 text-center flex-shrink-0"
                          style={{
                            width: "52px",
                            minWidth: "52px",
                            padding: "8px 4px",
                            background: "#f4f7fd",
                            border: "1px solid #dbe2ef"
                          }}
                        >
                          <div className="fw-bold" style={{ fontSize: "1.15rem", lineHeight: 1 }}>
                            {day}
                          </div>
                          <div className="small text-primary fw-semibold" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                            {month}
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold mb-1" style={{ lineHeight: 1.15 }}>
                            {event.title}
                          </div>
                          <div className="text-muted small mb-2 d-flex align-items-center gap-1">
                            <Clock size={13} />
                            {time} · {event.location || event.format || "Online"}
                          </div>
                          <span className={`badge rounded-pill px-2 py-1 ${chipClass}`} style={{ fontWeight: 600 }}>
                            {chip}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-4 p-3 text-center" style={{ background: "#fff", border: "1px dashed #e3e7ee" }}>
                  <small className="text-muted">No upcoming events found.</small>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 18, height: 18, background: "#eef7ee", color: "#15803d", fontSize: 12 }}
              >
                {"\uD83D\uDC65"}
              </span>
              Your Network
            </h6>

            <div className="d-grid gap-3">
              {(sidebarConnections.length > 0 ? sidebarConnections : sidebarMentors.slice(0, 3)).map((item) => {
                const person = item.connectedUser || item;
                const isConnection = Boolean(item.connectedUser);
                const avatar = person.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || "User")}&background=0D8ABC&color=fff&size=80`;
                const title = person.alumniProfile?.company
                  ? `${person.alumniProfile.company}${person.alumniProfile.location ? ` @ ${person.alumniProfile.location}` : ""}`
                  : person.alumniProfile?.branch || person.studentProfile?.branch || "GCE Community";

                return (
                  <div
                    key={person._id}
                    className="rounded-4 p-3"
                    style={{ background: "#fff", border: "1px solid #e3e7ee" }}
                  >
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <img
                        src={avatar}
                        alt={person.name}
                        className="rounded-circle"
                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div className="fw-semibold" style={{ lineHeight: 1.15 }}>
                          {person.name}
                        </div>
                        <div className="text-muted small" style={{ lineHeight: 1.25 }}>
                          {person.alumniProfile?.company
                            ? `${person.alumniProfile.company}${person.alumniProfile.location ? ` @ ${person.alumniProfile.location}` : ""}`
                            : title}
                        </div>
                      </div>
                    </div>
                    <button
                      className={`btn w-100 rounded-3 fw-semibold ${isConnection ? "btn-outline-primary" : "btn-outline-success"}`}
                      type="button"
                      onClick={() => {
                        if (isConnection) {
                          navigate("/messages");
                          return;
                        }
                        sendSidebarConnectionRequest(person._id);
                      }}
                      disabled={!isConnection && sidebarPendingRequests[person._id]}
                    >
                      {isConnection ? "Message" : sidebarPendingRequests[person._id] ? "Requested" : "Connect"}
                    </button>
                  </div>
                );
              })}

              {sidebarConnections.length === 0 && sidebarMentors.length === 0 && (
                <div className="rounded-4 p-3 text-center" style={{ background: "#fff", border: "1px dashed #e3e7ee" }}>
                  <small className="text-muted">No live network suggestions found.</small>
                </div>
              )}
            </div>
          </div>

          <div>
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 18, height: 18, background: "#fff4e5", color: "#d97706", fontSize: 12 }}
              >
                {"\uD83C\uDF10"}
              </span>
              Mentors for You
            </h6>

            <div className="d-grid gap-3">
              {sidebarMentors.length > 0 ? (
                sidebarMentors.map((mentor) => {
                  const avatar = mentor.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name || "User")}&background=0D8ABC&color=fff&size=80`;
                  const mentorLine = mentor.alumniProfile?.company
                    ? `${mentor.alumniProfile.company}${mentor.alumniProfile.location ? ` @ ${mentor.alumniProfile.location}` : ""}`
                    : mentor.alumniProfile?.branch || "Mentor";
                  const pending = sidebarPendingRequests[mentor._id];

                  return (
                    <div
                      key={mentor._id}
                      className="rounded-4 p-3"
                      style={{ background: "#fff", border: "1px solid #e3e7ee" }}
                    >
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <img
                          src={avatar}
                          alt={mentor.name}
                          className="rounded-circle"
                          style={{ width: "40px", height: "40px", objectFit: "cover" }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div className="fw-semibold" style={{ lineHeight: 1.15 }}>
                            {mentor.name}
                          </div>
                          <div className="text-muted small" style={{ lineHeight: 1.25 }}>
                            {mentorLine}
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-outline-warning w-100 rounded-3 fw-semibold"
                        type="button"
                        onClick={() => sendSidebarConnectionRequest(mentor._id)}
                        disabled={pending}
                      >
                        {pending ? "Requested" : "Ask"}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-4 p-3 text-center" style={{ background: "#fff", border: "1px dashed #e3e7ee" }}>
                  <small className="text-muted">No mentor suggestions available right now.</small>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <footer className="student-footer mt-5">
        <div className="container student-footer__container">
          <div className="student-footer__top">
            <div className="student-footer__links">
              <Link to="/about">About</Link>
              <a href="mailto:support@alumnconnect.com">Contact</a>
              <Link to="/privacy-policy">Privacy</Link>
              <Link to="/terms-of-service">Terms</Link>
            </div>
            <div className="student-footer__socials">
              <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a>
            </div>
          </div>
          <div className="student-footer__divider" />
          <p className="student-footer__copyright">&copy; 2026 Alumni Connect</p>
        </div>
      </footer>

      <CreatePostModal
        show={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handleCreatePost}
      />
    </div>
  );
};

export default Dashboard;
