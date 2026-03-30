import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
    photoUrl: "",
    skillsText: "",
    interestsText: "",
    projectsText: "",
    achievementsText: "",
    resumeUrl: ""
  });
  const [resume, setResume] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      loadProfile();
      loadMyJobs();
      loadMyApplications();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const res = await api.get("/profile/me");
      const me = res.data.user;
      const achievements = Array.isArray(me.achievements) ? me.achievements : [];
      const skills = Array.isArray(me.skills) ? me.skills : [];
      const interests = Array.isArray(me.interests) ? me.interests : [];
      const projects = Array.isArray(me.projects) ? me.projects : [];

      setProfileData({
        name: me.name || "",
        title: me.alumniProfile?.position || me.studentProfile?.major || "",
        company: me.alumniProfile?.company || "",
        location: me.alumniProfile?.location || me.studentProfile?.city || "",
        institution: "Government College of Engineering",
        graduationYear: me.alumniProfile?.graduationYear || me.studentProfile?.graduationYear || "",
        bio: me.bio || "",
        email: me.email || "",
        photoUrl: me.photoUrl || `https://i.pravatar.cc/200?u=${me.email}`,
        skillsText: skills.join("\n"),
        interestsText: interests.join("\n"),
        projectsText: projects.join("\n"),
        achievementsText: achievements.join("\n"),
        resumeUrl: me.resumeUrl || ""
      });
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

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

  const loadMyApplications = async () => {
    if (user?.role === "student") {
      try {
        const res = await api.get("/jobs/me/applications");
        setMyApplications(res.data.applications || []);
      } catch (err) {
        console.error("Failed to load applications", err);
        setMyApplications([]);
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
      const skills = profileData.skillsText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const interests = profileData.interestsText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const projects = profileData.projectsText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const achievements = profileData.achievementsText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      if (profilePhoto) {
        const photoData = new FormData();
        photoData.append("photo", profilePhoto);
        const photoRes = await api.post("/profile/me/photo", photoData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setProfileData((prev) => ({ ...prev, photoUrl: photoRes.data.photoUrl || prev.photoUrl }));
      }

      await api.patch("/profile/me", {
        name: profileData.name,
        bio: profileData.bio,
        skills,
        interests,
        projects,
        achievements,
        graduationYear: String(profileData.graduationYear || ""),
        branch: profileData.title,
        company: profileData.company,
        location: profileData.location
      });

      setMessage("Profile updated successfully!");
      setProfilePhoto(null);
      setEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const status = err?.response?.status;
      const apiMessage = err?.response?.data?.message;
      if (status === 401) {
        setMessage("Session expired. Please log in again.");
        return;
      }
      setMessage(apiMessage || "Failed to update profile");
    }
  };

  const handleResumeUpload = async () => {
    if (!resume) {
      setMessage("Please select a PDF resume first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("resume", resume);
      const res = await api.post("/profile/me/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfileData({ ...profileData, resumeUrl: res.data.resumeUrl || "" });
      setResume(null);
      setMessage("Resume uploaded successfully!");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to upload resume");
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
                  <>
                    <textarea 
                      name="bio"
                      className="form-control mb-2"
                      rows="4"
                      placeholder="Tell others about yourself..."
                      value={profileData.bio}
                      onChange={handleInputChange}
                    />
                    <label className="form-label fw-semibold small mt-3">Skills (one per line)</label>
                    <textarea
                      name="skillsText"
                      className="form-control"
                      rows="4"
                      placeholder="Example:\nJavaScript\nReact\nNode.js"
                      value={profileData.skillsText}
                      onChange={handleInputChange}
                    />
                    <label className="form-label fw-semibold small mt-3">Interests (one per line)</label>
                    <textarea
                      name="interestsText"
                      className="form-control"
                      rows="4"
                      placeholder="Example:\nAI\nWeb Development\nOpen Source"
                      value={profileData.interestsText}
                      onChange={handleInputChange}
                    />
                    <label className="form-label fw-semibold small mt-3">Projects (one per line)</label>
                    <textarea
                      name="projectsText"
                      className="form-control"
                      rows="4"
                      placeholder="Example:\nAlumni Portal\nAttendance Predictor"
                      value={profileData.projectsText}
                      onChange={handleInputChange}
                    />
                    <label className="form-label fw-semibold small">Achievements (one per line)</label>
                    <textarea
                      name="achievementsText"
                      className="form-control"
                      rows="5"
                      placeholder="Example:\nPlaced 1st in National Hackathon\nPublished IEEE paper"
                      value={profileData.achievementsText}
                      onChange={handleInputChange}
                    />
                  </>
                ) : (
                  <>
                    <p className="small text-muted">{profileData.bio || "No bio added yet."}</p>
                    <div className="mb-3">
                      <h6 className="fw-semibold mb-2">Skills</h6>
                      {profileData.skillsText ? (
                        <ul className="small mb-0">
                          {profileData.skillsText.split("\n").filter(Boolean).map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="small text-muted mb-0">No skills listed.</p>
                      )}
                    </div>
                    <div className="mb-3">
                      <h6 className="fw-semibold mb-2">Interests</h6>
                      {profileData.interestsText ? (
                        <ul className="small mb-0">
                          {profileData.interestsText.split("\n").filter(Boolean).map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="small text-muted mb-0">No interests listed.</p>
                      )}
                    </div>
                    <div className="mb-3">
                      <h6 className="fw-semibold mb-2">Projects</h6>
                      {profileData.projectsText ? (
                        <ul className="small mb-0">
                          {profileData.projectsText.split("\n").filter(Boolean).map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="small text-muted mb-0">No projects listed.</p>
                      )}
                    </div>
                    <div>
                      <h6 className="fw-semibold mb-2">Achievements</h6>
                      {profileData.achievementsText ? (
                        <ul className="small mb-0">
                          {profileData.achievementsText.split("\n").filter(Boolean).map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="small text-muted mb-0">No achievements listed.</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Resume Upload */}
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
                  <>
                    <small className="text-success d-block mt-2">✓ {resume.name}</small>
                    <button className="btn btn-sm btn-primary mt-2" onClick={handleResumeUpload}>
                      Upload Resume
                    </button>
                  </>
                )}
                {profileData.resumeUrl && (
                  <a
                    href={profileData.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="d-block mt-2 small"
                  >
                    Open uploaded resume
                  </a>
                )}
              </div>

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

                {myApplications.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    You have not applied to any jobs yet.
                  </p>
                ) : (
                  myApplications.slice(0, 5).map((application) => (
                    <div key={application._id} className="border rounded p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="fw-bold mb-1">{application.job?.title || "Job"}</h6>
                          <div className="text-muted small mb-1">{application.job?.company || "Unknown company"}</div>
                          {application.job?.location && (
                            <div className="text-muted small">{application.job.location}</div>
                          )}
                        </div>
                        <span
                          className={`badge ${
                            application.status === "accepted"
                              ? "bg-success"
                              : application.status === "rejected"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                          }`}
                        >
                          {(application.status || "pending").toUpperCase()}
                        </span>
                      </div>

                      {application.job?._id && (
                        <div className="mt-2">
                          <Link to={`/jobs/${application.job._id}`} className="btn btn-sm btn-outline-primary">
                            View Job
                          </Link>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
