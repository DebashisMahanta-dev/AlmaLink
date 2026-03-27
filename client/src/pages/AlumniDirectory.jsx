import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Search, MapPin, Briefcase, GraduationCap, Mail, Building, UserPlus, CheckCircle } from "lucide-react";

const AlumniDirectory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("directory"); // "directory" or "network"
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatuses, setConnectionStatuses] = useState({}); // Track connection status
  const [filters, setFilters] = useState({
    name: "",
    year: "",
    branch: "",
    location: "",
    company: ""
  });
  const debounceTimer = useRef(null);

  useEffect(() => {
    loadAlumni();
  }, []);

  // Auto-filter when any filter changes (with debounce)
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      loadAlumni();
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [filters]);

  const loadAlumni = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.name) params.name = filters.name;
      if (filters.year) params.year = filters.year;
      if (filters.branch) params.branch = filters.branch;
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
    // Clear debounce timer and search immediately
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    loadAlumni();
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleClearFilters = () => {
    setFilters({ name: "", year: "", branch: "", location: "", company: "" });
    setTimeout(() => loadAlumni(), 100);
  };

  const sendConnectionRequest = async (alumId) => {
    try {
      await api.post("/connections/request", {
        receiverId: alumId,
        message: "I'd like to connect with you"
      });
      setConnectionStatuses({
        ...connectionStatuses,
        [alumId]: "sent"
      });
      // Optionally show success message
      alert("Connection request sent!");
    } catch (err) {
      // Check if already connected or request pending
      const message = err?.response?.data?.message || "Failed to send connection request";
      alert(message);
    }
  };

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", paddingBottom: "40px" }}>
      <div className="container py-4">
        <div className="row mb-4">
          <div className="col-md-8">
            <h2 className="fw-bold mb-3">Government College of Engineering Community</h2>
            <p className="text-muted">Search and connect with alumni from Government College of Engineering</p>
            
            {/* Tabs for Directory and Network */}
            <div className="mt-3">
              <div className="btn-group" role="tablist">
                <button
                  className={`btn ${activeTab === "directory" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setActiveTab("directory")}
                  role="tab"
                >
                  Alumni Directory
                </button>
                <button
                  className={`btn ${activeTab === "network" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setActiveTab("network")}
                  role="tab"
                >
                  Alumni Circle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded p-4 mb-4 shadow-sm" style={{ border: "1px solid #e0e0e0" }}>
          <h5 className="fw-bold mb-3">
            <Search size={20} className="me-2" />
            Search Filters
            <small className="text-muted ms-2" style={{ fontSize: "0.85rem", fontWeight: "normal" }}>(Filters update as you type)</small>
          </h5>
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Name <span className="badge bg-info ms-1">Auto-filters</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  autoComplete="off"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Graduation Year</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g., 2020"
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  min="1980"
                  max={new Date().getFullYear()}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Branch/Department</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Computer Science"
                  name="branch"
                  value={filters.branch}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., New York"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Company</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Google"
                  name="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button type="submit" className="btn btn-primary me-2 flex-grow-1">
                  <Search size={16} className="me-1" />
                  Search
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleClearFilters}
                >
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="mb-3">
          <h5 className="fw-bold">
            {loading ? "Loading..." : `${alumni.length} Alumni Found`}
          </h5>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {alumni.map((alum) => (
              <div key={alum._id} className="col-md-6 col-lg-4">
                <div
                  className="bg-white rounded p-4 shadow-sm h-100"
                  style={{
                    border: "1px solid #e0e0e0",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "";
                  }}
                  onClick={() => navigate(`/profile/${alum._id}`)}
                >
                  <div className="d-flex align-items-center mb-3">
                    <img
                      src={`https://i.pravatar.cc/60?u=${alum.email}`}
                      alt={alum.name}
                      className="rounded-circle me-3"
                      style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    />
                    <div>
                      <h6 className="fw-bold mb-0">{alum.name}</h6>
                      <small className="text-muted">
                        Class of {alum.alumniProfile?.graduationYear}
                      </small>
                    </div>
                  </div>

                  {alum.alumniProfile?.branch && (
                    <div className="d-flex align-items-center mb-2">
                      <GraduationCap size={16} className="me-2 text-muted" />
                      <small>{alum.alumniProfile.branch}</small>
                    </div>
                  )}

                  {alum.alumniProfile?.company && (
                    <div className="d-flex align-items-center mb-2">
                      <Briefcase size={16} className="me-2 text-muted" />
                      <small className="fw-semibold">{alum.alumniProfile.company}</small>
                    </div>
                  )}

                  {alum.alumniProfile?.location && (
                    <div className="d-flex align-items-center mb-2">
                      <MapPin size={16} className="me-2 text-muted" />
                      <small>{alum.alumniProfile.location}</small>
                    </div>
                  )}

                  <div className="d-flex align-items-center mb-3">
                    <Mail size={16} className="me-2 text-muted" />
                    <small className="text-truncate">{alum.email}</small>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary flex-grow-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${alum._id}`);
                      }}
                    >
                      View Profile
                    </button>
                    <button
                      className={`btn btn-sm flex-grow-1 ${
                        connectionStatuses[alum._id] === "sent"
                          ? "btn-success"
                          : "btn-outline-success"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        sendConnectionRequest(alum._id);
                      }}
                      disabled={connectionStatuses[alum._id] === "sent"}
                    >
                      {connectionStatuses[alum._id] === "sent" ? (
                        <>
                          <CheckCircle size={14} className="me-1" />
                          Requested
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} className="me-1" />
                          Connect
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {alumni.length === 0 && !loading && (
              <div className="col-12">
                <div className="text-center py-5">
                  <Search size={64} className="text-muted mb-3" />
                  <h5 className="text-muted">No alumni found</h5>
                  <p className="text-muted">Try adjusting your search filters</p>
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
