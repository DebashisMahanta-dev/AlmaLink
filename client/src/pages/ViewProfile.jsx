import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import PostCard from "../components/PostCard";
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Mail, 
  Calendar,
  Trophy,
  FileText,
  User as UserIcon,
  Loader
} from "lucide-react";

const ViewProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/alumni/${id}`);
      setUser(res.data.user);
      setPosts(res.data.posts);
    } catch (err) {
      console.error("Failed to load profile", err);
      setError(err.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <Loader size={48} className="text-primary animate-spin" />
          <p className="mt-3 text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h5>Error</h5>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate("/alumni")}>
            <ArrowLeft size={16} className="me-1" />
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <p>User not found</p>
          <button className="btn btn-primary" onClick={() => navigate("/alumni")}>
            <ArrowLeft size={16} className="me-1" />
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const profile = user.alumniProfile || user.studentProfile || {};
  const achievements = Array.isArray(user.achievements) ? user.achievements : [];
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", paddingBottom: "40px" }}>
      <div className="container py-4">
        {/* Back Button */}
        <button 
          className="btn btn-outline-primary mb-3"
          onClick={() => navigate("/alumni")}
        >
          <ArrowLeft size={16} className="me-1" />
          Back to Directory
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded shadow-sm p-4 mb-4">
          <div className="row">
            <div className="col-md-8">
              <div className="d-flex align-items-start mb-3">
                <img 
                  src={`https://i.pravatar.cc/120?u=${user.email}`}
                  alt={user.name}
                  className="rounded-circle me-3"
                  style={{ width: "120px", height: "120px", objectFit: "cover" }}
                />
                <div className="flex-grow-1">
                  <h2 className="fw-bold mb-1">{user.name}</h2>
                  <span className="badge bg-primary mb-2">
                    {user.role === "alumni" ? "Alumni" : "Student"}
                  </span>
                  
                  <div className="mt-3">
                    {profile.company && (
                      <div className="d-flex align-items-center mb-2">
                        <Briefcase size={18} className="me-2 text-muted" />
                        <span className="fw-semibold">{profile.company}</span>
                      </div>
                    )}
                    
                    {profile.location && (
                      <div className="d-flex align-items-center mb-2">
                        <MapPin size={18} className="me-2 text-muted" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    
                    {profile.branch && (
                      <div className="d-flex align-items-center mb-2">
                        <GraduationCap size={18} className="me-2 text-muted" />
                        <span>{profile.branch}</span>
                        {profile.graduationYear && (
                          <span className="ms-2 text-muted">• Class of {profile.graduationYear}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="d-flex align-items-center mb-2">
                      <Mail size={18} className="me-2 text-muted" />
                      <span className="text-truncate">{user.email}</span>
                    </div>

                    <div className="d-flex align-items-center text-muted">
                      <Calendar size={18} className="me-2" />
                      <small>Member since {memberSince}</small>
                    </div>

                    {user.resumeUrl && (
                      <div className="d-flex align-items-center mt-2">
                        <FileText size={18} className="me-2 text-muted" />
                        <a href={user.resumeUrl} target="_blank" rel="noreferrer">
                          Open Resume
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 d-flex flex-column justify-content-center">
              <div className="text-center p-3 bg-light rounded mb-2">
                <h4 className="fw-bold mb-0">{posts.length}</h4>
                <small className="text-muted">Posts</small>
              </div>
              <button className="btn btn-primary w-100">
                <Mail size={16} className="me-1" />
                Send Message
              </button>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded shadow-sm p-4 mb-4">
          <h5 className="fw-bold mb-3 d-flex align-items-center">
            <Trophy size={18} className="me-2" /> Achievements
          </h5>
          {achievements.length > 0 ? (
            <ul className="mb-0">
              {achievements.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mb-0">No achievements added yet.</p>
          )}
        </div>

        {/* Posts Section */}
        <div className="mb-3">
          <h4 className="fw-bold">Posts by {user.name.split(' ')[0]}</h4>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded shadow-sm p-5 text-center">
            <UserIcon size={48} className="text-muted mb-3" />
            <h5 className="text-muted">No posts yet</h5>
            <p className="text-muted">This user hasn't shared anything yet.</p>
          </div>
        ) : (
          <div className="row g-3">
            {posts.map((post) => (
              <div key={post._id} className="col-12">
                <PostCard 
                  post={post} 
                  onUpdate={handlePostUpdate}
                  onDelete={handlePostDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProfile;
