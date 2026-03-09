import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { MapPin, Briefcase, GraduationCap, Mail, Upload, Edit2 } from "lucide-react";
import api from "../services/api";

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    title: "",
    company: "",
    location: "",
    institution: "",
    graduationYear: "",
    bio: "",
    email: "",
    photoUrl: ""
  });
  const [resume, setResume] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        title: user.alumniProfile?.position || user.studentProfile?.major || "",
        company: user.alumniProfile?.company || "",
        location: user.alumniProfile?.location || user.studentProfile?.city || "",
        institution: "City University",
        graduationYear: user.alumniProfile?.graduationYear || user.studentProfile?.graduationYear || "",
        bio: user.bio || "Passionate professional. Always happy to connect with fellow alumni to share insights & mentor.",
        email: user.email || "",
        photoUrl: user.photoUrl || `https://i.pravatar.cc/200?u=${user.email}`
      });
      loadMyJobs();
    }
  }, [user]);

  const loadMyJobs = async () => {
    if (user?.role === "alumni") {
      try {
        const res = await api.get("/jobs");
        // Filter jobs posted by current user (in real app, backend would filter)
        setMyJobs(res.data.jobs?.slice(0, 2) || []);
      } catch (err) {
        console.error("Failed to load jobs", err);
      }
    }
  };

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      setProfileData({ ...profileData, photoUrl: URL.createObjectURL(file) });
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResume(file);
      setMessage(`Resume selected: ${file.name}`);
    }
  };

  const handleSave = async () => {
    try {
      // In a real app, upload to server
      setMessage("Profile updated successfully!");
      setEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to update profile");
    }
  };

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", paddingBottom: "40px" }}>
      {/* Hero Banner */}
      <div 
        style={{ 
          height: "200px", 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          position: "relative"
        }}
      >
        <div className="container" style={{ position: "relative", height: "100%" }}>
          <h2 className="text-white fw-bold" style={{ paddingTop: "60px" }}>
            Bridge Your Future.<br />Connect with Alumni
          </h2>
          <p className="text-white">Unlock career opportunities, mentorship,<br />and a powerful network</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: "-80px", position: "relative" }}>
        {message && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
          </div>
        )}

        <div className="row g-4">
          {/* Left Column - Profile */}
          <div className="col-lg-4">
            <div className="bg-white rounded p-4 shadow-sm" style={{ border: "1px solid #e0e0e0" }}>
              <h5 className="fw-bold mb-4">My Profile</h5>
              
              {/* Profile Photo */}
              <div className="text-center mb-4">
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img 
                    src={profileData.photoUrl}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ 
                      width: "120px", 
                      height: "120px", 
                      objectFit: "cover",
                      border: "4px solid #0077b5"
                    }}
                  />
                  {editing && (
                    <label 
                      htmlFor="photoUpload"
                      className="btn btn-sm btn-primary rounded-circle"
                      style={{ 
                        position: "absolute", 
                        bottom: "0", 
                        right: "0",
                        width: "32px",
                        height: "32px",
                        padding: "0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Upload size={16} />
                      <input 
                        type="file" 
                        id="photoUpload"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: "none" }}
                      />
                    </label>
                  )}
                </div>
                
                <div className="mt-3">
                  {editing ? (
                    <input 
                      type="text"
                      name="name"
                      className="form-control form-control-lg text-center fw-bold mb-2"
                      value={profileData.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <h5 className="fw-bold mb-1">{profileData.name}</h5>
                  )}
                  
                  {editing ? (
                    <input 
                      type="text"
                      name="title"
                      className="form-control text-center mb-2"
                      placeholder="Title/Position"
                      value={profileData.title}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-muted mb-0">{profileData.title}</p>
                  )}
                </div>

                {!editing && (
                  <button 
                    className="btn btn-outline-primary btn-sm mt-3"
                    onClick={() => setEditing(true)}
                  >
                    <Edit2 size={14} className="me-1" />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Profile Details */}
              <div className="mb-3">
                <div className="d-flex align-items-start mb-3">
                  <Briefcase size={18} className="me-2 mt-1 text-muted" />
                  <div className="flex-grow-1">
                    <small className="text-muted d-block">Current Role</small>
                    {editing ? (
                      <>
                        <input 
                          type="text"
                          name="title"
                          className="form-control form-control-sm mb-1"
                          placeholder="Position"
                          value={profileData.title}
                          onChange={handleInputChange}
                        />
                        <input 
                          type="text"
                          name="company"
                          className="form-control form-control-sm"
                          placeholder="Company"
                          value={profileData.company}
                          onChange={handleInputChange}
                        />
                      </>
                    ) : (
                      <>
                        <div className="fw-semibold">{profileData.title}</div>
                        <div className="d-flex align-items-center">
                          <img src="https://www.google.com/favicon.ico" alt="Company" style={{ width: "16px", height: "16px" }} className="me-1" />
                          <small>{profileData.company || "Not specified"}</small>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="d-flex align-items-start mb-3">
                  <GraduationCap size={18} className="me-2 mt-1 text-muted" />
                  <div className="flex-grow-1">
                    <small className="text-muted d-block">Institution</small>
                    {editing ? (
                      <>
                        <input 
                          type="text"
                          name="institution"
                          className="form-control form-control-sm mb-1"
                          value={profileData.institution}
                          onChange={handleInputChange}
                        />
                        <input 
                          type="number"
                          name="graduationYear"
                          className="form-control form-control-sm"
                          placeholder="Graduation Year"
                          value={profileData.graduationYear}
                          onChange={handleInputChange}
                        />
                      </>
                    ) : (
                      <>
                        <div className="fw-semibold">{profileData.institution}</div>
                        <small>Class of '{profileData.graduationYear?.toString().slice(-2)}</small>
                      </>
                    )}
                  </div>
                </div>

                <div className="d-flex align-items-start mb-3">
                  <MapPin size={18} className="me-2 mt-1 text-muted" />
                  <div className="flex-grow-1">
                    <small className="text-muted d-block">Location</small>
                    {editing ? (
                      <input 
                        type="text"
                        name="location"
                        className="form-control form-control-sm"
                        value={profileData.location}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="fw-semibold">{profileData.location || "Not specified"}</div>
                    )}
                  </div>
                </div>

                <div className="d-flex align-items-start">
                  <Mail size={18} className="me-2 mt-1 text-muted" />
                  <div className="flex-grow-1">
                    <small className="text-muted d-block">Email</small>
                    <div className="fw-semibold small">{profileData.email}</div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-4">
                {editing ? (
                  <textarea 
                    name="bio"
                    className="form-control"
                    rows="4"
                    placeholder="Tell others about yourself..."
                    value={profileData.bio}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="small text-muted">{profileData.bio}</p>
                )}
              </div>

              {/* Resume Upload */}
              {user?.role === "student" && (
                <div className="mt-4 pt-3" style={{ borderTop: "1px solid #e0e0e0" }}>
                  <label className="form-label fw-semibold small">
                    <Upload size={16} className="me-1" />
                    Upload Resume (PDF)
                  </label>
                  <input 
                    type="file"
                    className="form-control form-control-sm"
                    accept="application/pdf"
                    onChange={handleResumeChange}
                  />
                  {resume && (
                    <small className="text-success d-block mt-2">✓ {resume.name}</small>
                  )}
                </div>
              )}

              {editing && (
                <div className="d-flex gap-2 mt-4">
                  <button className="btn btn-primary flex-grow-1" onClick={handleSave}>
                    Save Changes
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Job Posts (Alumni) */}
          {user?.role === "alumni" && (
            <div className="col-lg-8">
              <div className="bg-white rounded p-4 shadow-sm" style={{ border: "1px solid #e0e0e0" }}>
                <h5 className="fw-bold mb-4">My Job Posts</h5>
                
                {myJobs.map((job) => (
                  <div key={job._id} className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex gap-3">
                        <img 
                          src={`https://i.pravatar.cc/60?img=${job._id}`}
                          alt="Company"
                          className="rounded-circle"
                          style={{ width: "60px", height: "60px" }}
                        />
                        <div>
                          <h6 className="fw-bold mb-1">{job.title}</h6>
                          <div className="text-muted small mb-2">{job.company}</div>
                          <div className="text-muted small">{job.location || "Remote"}</div>
                        </div>
                      </div>
                      <button className="btn btn-success btn-sm">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}

                {myJobs.length === 0 && (
                  <p className="text-muted text-center py-4">
                    You haven't posted any jobs yet
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Right Column - Applications (Student) */}
          {user?.role === "student" && (
            <div className="col-lg-8">
              <div className="bg-white rounded p-4 shadow-sm" style={{ border: "1px solid #e0e0e0" }}>
                <h5 className="fw-bold mb-4">My Applications</h5>
                <p className="text-muted text-center py-4">
                  Your job applications will appear here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
