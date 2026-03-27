import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Info,
  LogIn,
  UserPlus,
  LogOut,
  Users,
  Briefcase,
  Calendar,
  MessageSquare,
  User,
  Plus,
  FileText,
  CheckSquare,
  Trash2,
  Bell,
  Search,
  Menu,
  X,
  Edit3,
  UserCheck
} from "lucide-react";

const NavBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleProfileDropdown = () => setProfileDropdown(!profileDropdown);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setProfileDropdown(false);
  };

  // PUBLIC NAVBAR (Not logged in)
  if (!user) {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary navbar-sticky">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/">
            <span style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>🎓</span>
            GCE Connect
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className={`collapse navbar-collapse ${mobileMenuOpen ? "show" : ""}`}>
            <ul className="navbar-nav ms-auto gap-1">
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/") ? "active" : ""}`}
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={18} className="me-1" />
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/about") ? "active" : ""}`}
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Info size={18} className="me-1" />
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="btn btn-outline-light btn-sm ms-2"
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn size={16} className="me-1" />
                  Sign In
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="btn btn-light btn-sm"
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus size={16} className="me-1" />
                  Join
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  // STUDENT NAVBAR
  if (user.role === "student") {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary navbar-sticky">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/">
            <span style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>🎓</span>
            GCE Connect
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className={`collapse navbar-collapse ${mobileMenuOpen ? "show" : ""}`}>
            {/* Left Navigation */}
            <ul className="navbar-nav me-auto gap-1">
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/") ? "active" : ""}`}
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={18} className="me-1" />
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/alumni") ? "active" : ""}`}
                  to="/alumni"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users size={18} className="me-1" />
                  Alumni Directory
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/jobs") ? "active" : ""}`}
                  to="/jobs"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Briefcase size={18} className="me-1" />
                  Jobs
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/events") ? "active" : ""}`}
                  to="/events"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Calendar size={18} className="me-1" />
                  Events
                </Link>
              </li>
            </ul>

            {/* Right Navigation */}
            <ul className="navbar-nav gap-1 align-items-lg-center">
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/connections") ? "active" : ""}`}
                  to="/connections"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCheck size={18} className="me-1" />
                  Connections
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/messages") ? "active" : ""}`}
                  to="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare size={18} className="me-1" />
                  <span className="badge bg-warning text-dark ms-1">3</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/my-applications") ? "active" : ""}`}
                  to="/my-applications"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText size={18} className="me-1" />
                  Applications
                </Link>
              </li>

              {/* Profile Dropdown */}
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  onClick={toggleProfileDropdown}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <img 
                    src={`https://i.pravatar.cc/32?u=${user.email}`}
                    alt="Profile"
                    className="rounded-circle me-2"
                    style={{ width: "32px", height: "32px" }}
                  />
                  <span>Hi, {user.name?.split(' ')[0] || user.name}</span>
                </button>
                {profileDropdown && (
                  <div className="dropdown-menu show">
                    <Link
                      className="dropdown-item"
                      to="/profile"
                      onClick={() => {
                        setProfileDropdown(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <User size={16} className="me-2" />
                      My Profile
                    </Link>
                    <hr className="dropdown-divider" />
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                      style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
                    >
                      <LogOut size={16} className="me-2" />
                      Logout
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  // ALUMNI NAVBAR
  if (user.role === "alumni") {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-success navbar-sticky">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/">
            <span style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>🎓</span>
            GCE Connect
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className={`collapse navbar-collapse ${mobileMenuOpen ? "show" : ""}`}>
            {/* Left Navigation */}
            <ul className="navbar-nav me-auto gap-1">
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/") ? "active" : ""}`}
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={18} className="me-1" />
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/alumni") ? "active" : ""}`}
                  to="/alumni"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users size={18} className="me-1" />
                  Alumni Directory
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/my-jobs") ? "active" : ""}`}
                  to="/my-jobs"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Briefcase size={18} className="me-1" />
                  My Job Posts
                </Link>
              </li>
            </ul>

            {/* Right Navigation */}
            <ul className="navbar-nav gap-1 align-items-lg-center">
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/connections") ? "active" : ""}`}
                  to="/connections"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCheck size={18} className="me-1" />
                  Connections
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/messages") ? "active" : ""}`}
                  to="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare size={18} className="me-1" />
                  <span className="badge bg-warning text-dark ms-1">2</span>
                </Link>
              </li>

              {/* Profile Dropdown */}
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  onClick={toggleProfileDropdown}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <img 
                    src={`https://i.pravatar.cc/32?u=${user.email}`}
                    alt="Profile"
                    className="rounded-circle me-2"
                    style={{ width: "32px", height: "32px" }}
                  />
                  <span>Hi, {user.name?.split(' ')[0] || user.name}</span>
                </button>
                {profileDropdown && (
                  <div className="dropdown-menu show">
                    <Link
                      className="dropdown-item"
                      to="/profile"
                      onClick={() => {
                        setProfileDropdown(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <User size={16} className="me-2" />
                      My Profile
                    </Link>
                    <hr className="dropdown-divider" />
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                      style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
                    >
                      <LogOut size={16} className="me-2" />
                      Logout
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  // ADMIN NAVBAR
  if (user.role === "admin") {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-danger navbar-sticky">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/">
            <span style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>🎓</span>
            GCE Connect
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className={`collapse navbar-collapse ${mobileMenuOpen ? "show" : ""}`}>
            {/* Left Navigation */}
            <ul className="navbar-nav me-auto gap-1">
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/admin") ? "active" : ""}`}
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={18} className="me-1" />
                  Admin Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/approve-alumni") ? "active" : ""}`}
                  to="/approve-alumni"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <CheckSquare size={18} className="me-1" />
                  Approve Alumni
                  <span className="badge bg-warning text-dark ms-2">5</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/manage-jobs") ? "active" : ""}`}
                  to="/manage-jobs"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Briefcase size={18} className="me-1" />
                  Manage Jobs
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/announcements") ? "active" : ""}`}
                  to="/announcements"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bell size={18} className="me-1" />
                  Announcements
                </Link>
              </li>
            </ul>

            {/* Right Navigation */}
            <ul className="navbar-nav gap-1 align-items-lg-center">
              {/* Profile Dropdown */}
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  onClick={toggleProfileDropdown}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <img 
                    src={`https://i.pravatar.cc/32?u=${user.email}`}
                    alt="Profile"
                    className="rounded-circle me-2"
                    style={{ width: "32px", height: "32px" }}
                  />
                  <span>Hi, {user.name?.split(' ')[0] || user.name}</span>
                </button>
                {profileDropdown && (
                  <div className="dropdown-menu show">
                    <Link
                      className="dropdown-item"
                      to="/admin/profile"
                      onClick={() => {
                        setProfileDropdown(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <User size={16} className="me-2" />
                      Admin Profile
                    </Link>
                    <hr className="dropdown-divider" />
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                      style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
                    >
                      <LogOut size={16} className="me-2" />
                      Logout
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  return null;
};

export default NavBar;

