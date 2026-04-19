import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import {
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  Mail,
  UserPlus,
  CheckCircle,
  Sparkles,
  Users,
  BadgeCheck,
  ArrowRight,
  Filter,
  Building2
} from "lucide-react";

const AlumniDirectory = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("directory");
  const [alumni, setAlumni] = useState([]);
  const [skillOptions, setSkillOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [filters, setFilters] = useState({
    name: "",
    year: "",
    branch: "",
    skill: "",
    location: "",
    company: ""
  });
  const debounceTimer = useRef(null);

  useEffect(() => {
    loadAlumni();
    loadSkillOptions();
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      loadAlumni();
    }, 350);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [filters]);

  const loadSkillOptions = async () => {
    try {
      const res = await api.get("/alumni/skills");
      setSkillOptions(res.data.skills || []);
    } catch (err) {
      console.error("Failed to load skill options", err);
      setSkillOptions([]);
    }
  };

  const loadAlumni = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.name) params.name = filters.name;
      if (filters.year) params.year = filters.year;
      if (filters.branch) params.branch = filters.branch;
      if (filters.skill) params.skill = filters.skill;
      if (filters.location) params.location = filters.location;
      if (filters.company) params.company = filters.company;

      const res = await api.get("/alumni", { params });
      setAlumni(res.data.alumni || []);
    } catch (err) {
      console.error("Failed to load alumni", err);
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    loadAlumni();
  };

  const handleFilterChange = (e) => {
    setFilters((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleClearFilters = () => {
    setFilters({ name: "", year: "", branch: "", skill: "", location: "", company: "" });
    setTimeout(() => loadAlumni(), 100);
  };

  const sendConnectionRequest = async (alumId) => {
    try {
      await api.post("/connections/request", {
        receiverId: alumId,
        message: "Let's connect within the GCE community!"
      });
      setConnectionStatuses((current) => ({
        ...current,
        [alumId]: "sent"
      }));
      toast.success("Connection request sent!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send connection request");
    }
  };

  const tabs = [
    { key: "directory", label: "Alumni Directory", icon: Users },
    { key: "network", label: "Alumni Circle", icon: Sparkles }
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(59, 130, 246, 0.10), transparent 28%), radial-gradient(circle at top right, rgba(16, 185, 129, 0.10), transparent 24%), linear-gradient(135deg, #eef4fb 0%, #f7fafc 100%)",
        paddingBottom: "40px"
      }}
    >
      <div className="container py-4">
        <div
          className="rounded-4 p-4 p-md-5 mb-4 position-relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 55%, #eef6ff 100%)",
            border: "1px solid #dbeafe",
            boxShadow: "0 18px 40px rgba(14, 30, 37, 0.06)"
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "auto -60px -50px auto",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)"
            }}
          />
          <div className="position-relative">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <span className="badge rounded-pill px-3 py-2 text-bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-2">
                <BadgeCheck size={14} />
                Approved community
              </span>
              <span className="badge rounded-pill px-3 py-2 text-bg-light text-secondary border">
                {alumni.length} users
              </span>
              <span className="badge rounded-pill px-3 py-2 text-bg-light text-secondary border">
                Live search
              </span>
            </div>

            <h2 className="fw-bold mb-2" style={{ fontSize: "clamp(2rem, 4vw, 2.9rem)", letterSpacing: "-0.03em" }}>
              Government College of Engineering Community
            </h2>
            <p className="text-muted mb-4" style={{ maxWidth: "46rem", fontSize: "1.05rem" }}>
              Search approved students and alumni, discover shared skills, and connect with people across the GCE network.
            </p>

            <div className="d-flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`btn btn-lg rounded-pill px-4 d-inline-flex align-items-center gap-2 ${active ? "btn-primary" : "btn-outline-primary"}`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-4 p-4 p-md-5 mb-4" style={{ background: "#fff", border: "1px solid #e3e8ef" }}>
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <Filter size={20} className="text-primary" />
            Search Filters
            <span className="text-muted fw-normal small">(updates as you type)</span>
          </h5>

          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold small">Name</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Search by name"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  autoComplete="off"
                  style={{ borderRadius: "16px", padding: "14px 16px" }}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold small">Graduation Year</label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  placeholder="e.g., 2020"
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  min="1980"
                  max={new Date().getFullYear()}
                  style={{ borderRadius: "16px", padding: "14px 16px" }}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold small">Branch / Department</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="e.g., Computer Science"
                  name="branch"
                  value={filters.branch}
                  onChange={handleFilterChange}
                  style={{ borderRadius: "16px", padding: "14px 16px" }}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold small">Skill</label>
                <select
                  className="form-select form-select-lg"
                  name="skill"
                  value={filters.skill}
                  onChange={handleFilterChange}
                  style={{ borderRadius: "16px", padding: "14px 16px" }}
                >
                  <option value="">All Skills</option>
                  {skillOptions.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold small">Location</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="e.g., New York"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  style={{ borderRadius: "16px", padding: "14px 16px" }}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold small">Company</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="e.g., Google"
                  name="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                  style={{ borderRadius: "16px", padding: "14px 16px" }}
                />
              </div>

              <div className="col-12 d-flex flex-wrap gap-2 mt-2">
                <button type="submit" className="btn btn-primary btn-lg rounded-pill px-4 d-inline-flex align-items-center gap-2">
                  <Search size={16} />
                  Search
                </button>
                <button type="button" className="btn btn-outline-secondary btn-lg rounded-pill px-4" onClick={handleClearFilters}>
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <div>
            <h5 className="fw-bold mb-1">
              {loading ? "Loading..." : `${alumni.length} users found`}
            </h5>
            <p className="text-muted small mb-0">Browse profiles and send connection requests to approved users.</p>
          </div>
          <div className="badge rounded-pill text-bg-light text-secondary border px-3 py-2">
            <Building2 size={14} className="me-1" />
            GCE network
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {alumni.map((alum) => {
              const profile = alum.role === "student" ? alum.studentProfile : alum.alumniProfile;
              const graduationYear = profile?.graduationYear;
              const branch = profile?.branch;
              const location = alum.role === "student" ? profile?.country : profile?.location;
              const company = alum.alumniProfile?.company;
              const avatar =
                alum.photoUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(alum.name || "User")}&background=0D8ABC&color=fff&size=80`;

              return (
                <div key={alum._id} className="col-md-6 col-xl-4">
                  <div
                    className="rounded-4 p-4 h-100"
                    style={{
                      background: "#fff",
                      border: "1px solid #e3e8ef",
                      boxShadow: "0 12px 24px rgba(14, 30, 37, 0.05)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 16px 28px rgba(14, 30, 37, 0.09)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 12px 24px rgba(14, 30, 37, 0.05)";
                    }}
                  >
                    <div className="d-flex align-items-center mb-3 gap-3">
                      <img
                        src={avatar}
                        alt={alum.name}
                        className="rounded-circle"
                        style={{ width: 62, height: 62, objectFit: "cover", border: "2px solid #e8eefc" }}
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          <h6 className="fw-bold mb-0">{alum.name}</h6>
                          <span className="badge rounded-pill text-bg-primary-subtle text-primary border border-primary-subtle">
                            {alum.role}
                          </span>
                        </div>
                        {graduationYear && <small className="text-muted">Class of {graduationYear}</small>}
                      </div>
                    </div>

                    <div className="d-grid gap-2 mb-3">
                      {branch && (
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <GraduationCap size={15} />
                          <span>{branch}</span>
                        </div>
                      )}
                      {company && (
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <Briefcase size={15} />
                          <span className="fw-semibold">{company}</span>
                        </div>
                      )}
                      {location && (
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <MapPin size={15} />
                          <span>{location}</span>
                        </div>
                      )}
                      <div className="d-flex align-items-center gap-2 text-muted small">
                        <Mail size={15} />
                        <span className="text-truncate">{alum.email}</span>
                      </div>
                    </div>

                    {Array.isArray(alum.skills) && alum.skills.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 mb-4">
                        {alum.skills.slice(0, 4).map((skill) => (
                          <span key={`${alum._id}-${skill}`} className="badge rounded-pill text-bg-light text-secondary border px-3 py-2">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary rounded-pill flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
                        onClick={() => navigate(`/profile/${alum._id}`)}
                        type="button"
                      >
                        View Profile
                        <ArrowRight size={15} />
                      </button>
                      <button
                        className={`btn rounded-pill flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2 ${
                          connectionStatuses[alum._id] === "sent" ? "btn-success" : "btn-outline-success"
                        }`}
                        onClick={() => sendConnectionRequest(alum._id)}
                        disabled={connectionStatuses[alum._id] === "sent"}
                        type="button"
                      >
                        {connectionStatuses[alum._id] === "sent" ? (
                          <>
                            <CheckCircle size={15} />
                            Requested
                          </>
                        ) : (
                          <>
                            <UserPlus size={15} />
                            Connect
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {alumni.length === 0 && !loading && (
              <div className="col-12">
                <div className="rounded-4 p-5 text-center" style={{ background: "#fff", border: "1px solid #e3e8ef" }}>
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: 72, height: 72, background: "#f2f6ff", color: "#94a3b8" }}
                  >
                    <Search size={34} />
                  </div>
                  <h5 className="fw-semibold mb-2">No users found</h5>
                  <p className="text-muted mb-0">Try adjusting your search filters or clear them to browse everyone.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniDirectory;
