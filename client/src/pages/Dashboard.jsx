import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Briefcase, Users, Calendar, MessageSquare, Home, Settings, LogOut, ChevronRight, Clock, MapPin, ExternalLink } from "lucide-react";
import CreatePostModal from "../components/CreatePostModal";
import PostCard from "../components/PostCard";

const Dashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    loadJobs();
    loadPosts();
  }, []);

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
      alert("Failed to edit post");
      throw err;
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      console.error("Failed to delete post", err);
      alert("Failed to delete post");
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "calc(100vh - 56px)" }}>
      <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
        {/* Left Sidebar */}
        <aside style={{ width: "250px", backgroundColor: "#fff", borderRight: "1px solid #e0e0e0", padding: "20px", position: "sticky", top: 0, height: "calc(100vh - 56px)", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", padding: "15px", backgroundColor: "#f0f4f8", borderRadius: "8px" }}>
            <img 
              src={`https://i.pravatar.cc/48?u=${user?.email}`}
              alt={user?.name}
              className="rounded-circle me-2"
              style={{ width: "40px", height: "40px" }}
            />
            <div>
              <div className="fw-semibold small">{user?.name}</div>
              <small className="text-muted">View Profile</small>
            </div>
          </div>

          <div className="list-group list-group-flush">
            <a href="/profile" className="list-group-item list-group-item-action border-0 py-3">
              <Users size={18} className="me-2" /> Profile
            </a>
            <a href="#posts" className="list-group-item list-group-item-action border-0 py-3">
              <MessageSquare size={18} className="me-2" /> My Posts
            </a>
            <a href="#mentorship" className="list-group-item list-group-item-action border-0 py-3">
              <Briefcase size={18} className="me-2" /> Mentorship
            </a>
            <a href="/events" className="list-group-item list-group-item-action border-0 py-3">
              <Calendar size={18} className="me-2" /> Events
            </a>
            <a href="/" className="list-group-item list-group-item-action border-0 py-3">
              <Home size={18} className="me-2" /> Home
            </a>
            <a href="/messages" className="list-group-item list-group-item-action border-0 py-3">
              <MessageSquare size={18} className="me-2" /> Messages
            </a>
          </div>

          <hr />

          <div className="list-group list-group-flush">
            <a href="#settings" className="list-group-item list-group-item-action border-0 py-3">
              <Settings size={18} className="me-2" /> Settings
            </a>
            <a href="/logout" className="list-group-item list-group-item-action border-0 py-3 text-danger">
              <LogOut size={18} className="me-2" /> Logout
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: "30px 20px" }}>
          {/* Alumni Approval Warning */}
          {user?.role === "alumni" && !user?.approved && (
            <div className="alert alert-warning mb-4" role="alert">
              <h5 className="alert-heading mb-2">
                <i className="bi bi-hourglass-split me-2"></i>
                Account Pending Admin Approval
              </h5>
              <p className="mb-0">
                Welcome to AlmaLink! Your alumni account is currently pending approval from an administrator. 
                Once approved, you'll be able to post job opportunities and access all alumni features.
              </p>
            </div>
          )}
          
          <div className="bg-white rounded-lg p-5 mb-4" style={{ borderBottom: "3px solid #0077b5" }}>
            <h1 className="fw-bold mb-2" style={{ fontSize: "2rem" }}>Welcome back, {user?.name?.split(" ")[0]}!</h1>
            <p className="text-muted mb-4">Unlock opportunities, mentorship, and grow your network.</p>
            <div className="d-flex gap-3">
              <button className="btn btn-primary px-4 py-2">Find Opportunities</button>
              <button className="btn btn-outline-primary px-4 py-2" onClick={() => setShowCreatePost(true)}>
                Share Experience
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4" style={{ border: "1px solid #e0e0e0" }}>
            <div className="d-flex gap-3 align-items-center">
              <img 
                src={`https://i.pravatar.cc/48?u=${user?.email}`}
                alt={user?.name}
                className="rounded-circle"
                style={{ width: "48px", height: "48px" }}
              />
              <input 
                type="text"
                className="form-control rounded-pill"
                placeholder="Create a new post..."
                onClick={() => setShowCreatePost(true)}
                readOnly
                style={{ backgroundColor: "#f8f9fa" }}
              />
            </div>
          </div>

          <div>
            <h5 className="fw-bold mb-3">Alumni Stories & Updates</h5>
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
              <div className="bg-white rounded-lg p-5 text-center" style={{ border: "1px solid #e0e0e0" }}>
                <MessageSquare size={48} className="text-muted mb-3" style={{ opacity: 0.5 }} />
                <p className="text-muted">No posts yet. Create one!</p>
              </div>
            )}
          </div>

          <div className="mt-5">
            <h5 className="fw-bold mb-3">Recent Job Postings</h5>
            <div style={{ display: "grid", gap: "20px" }}>
              {jobs.length > 0 ? (
                jobs.slice(0, 5).map((job) => (
                  <div key={job._id} className="bg-white rounded-lg p-4" style={{ border: "1px solid #e0e0e0" }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="fw-bold mb-1">{job.title}</h6>
                        <p className="mb-1 text-muted">{job.company}</p>
                        <small className="text-muted d-flex align-items-center gap-1">
                          <MapPin size={14} /> {job.location}
                        </small>
                      </div>
                      <button className="btn btn-link text-primary p-0">
                        <ExternalLink size={20} />
                      </button>
                    </div>
                    <p className="mb-3 text-muted small">{job.description?.substring(0, 100)}...</p>
                    <button className="btn btn-outline-primary btn-sm">View</button>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg p-5 text-center" style={{ border: "1px solid #e0e0e0" }}>
                  <Briefcase size={48} className="text-muted mb-3" style={{ opacity: 0.5 }} />
                  <p className="text-muted">No jobs available</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside style={{ width: "280px", backgroundColor: "#fff", borderLeft: "1px solid #e0e0e0", padding: "20px", position: "sticky", top: 0, height: "calc(100vh - 56px)", overflowY: "auto" }}>
          <div className="mb-5">
            <h6 className="fw-bold mb-3">📅 Upcoming Events</h6>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { title: "Alumni Meetup", date: "Feb 15", time: "6:00 PM" },
                { title: "Tech Webinar", date: "Feb 18", time: "3:00 PM" },
                { title: "Q&A Session", date: "Feb 22", time: "5:00 PM" }
              ].map((event, idx) => (
                <div key={idx} className="p-3 rounded" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e0e0e0" }}>
                  <div className="fw-semibold small">{event.title}</div>
                  <div className="text-muted small d-flex align-items-center gap-1 mt-1">
                    <Clock size={14} /> {event.date} at {event.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <h6 className="fw-bold mb-3">👥 Your Network</h6>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { name: "Sarah Johnson", title: "Software Engineer @ Google" },
                { name: "Mike Chen", title: "Product Manager @ Meta" },
                { name: "Emily Davis", title: "Data Analyst @ Amazon" }
              ].map((person, idx) => (
                <div key={idx} className="p-3 rounded border" style={{ borderColor: "#e0e0e0" }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <img 
                      src={`https://i.pravatar.cc/40?img=${idx + 1}`}
                      alt={person.name}
                      className="rounded-circle"
                      style={{ width: "36px", height: "36px" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div className="fw-semibold small">{person.name}</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>{person.title}</div>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline-primary w-100">Connect</button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h6 className="fw-bold mb-3 d-flex justify-content-between align-items-center">
              Suggestions
              <ChevronRight size={16} />
            </h6>
            <small className="text-muted">Based on your profile</small>
          </div>
        </aside>
      </div>

      <footer className="bg-white border-top mt-5" style={{ borderColor: "#e0e0e0" }}>
        <div className="container py-5">
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="d-flex gap-4 flex-wrap">
                <a href="#about" className="text-decoration-none text-muted small">About</a>
                <a href="#contact" className="text-decoration-none text-muted small">Contact</a>
                <a href="#privacy" className="text-decoration-none text-muted small">Privacy</a>
                <a href="#terms" className="text-decoration-none text-muted small">Terms</a>
              </div>
            </div>
            <div className="col-md-6 text-end">
              <div className="d-flex gap-3 justify-content-end">
                <a href="#github" className="text-muted">GitHub</a>
                <a href="#twitter" className="text-muted">Twitter</a>
              </div>
            </div>
          </div>
          <div className="text-center text-muted small border-top pt-3">
            <p>&copy; 2026 Alumni Connect</p>
          </div>
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
