import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";
import api from "../services/api";
import { FaGraduationCap, FaArrowRightToBracket, FaUserPlus, FaBars, FaXmark } from "react-icons/fa6";
import {
  Home,
  Users,
  Briefcase,
  Calendar,
  Bell,
  FileText,
  User,
  LogOut,
  Settings,
  ChevronDown,
  CheckSquare
} from "lucide-react";

const NavBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const userAvatar = user?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0D8ABC&color=fff&size=128`;
  const hasCustomPhoto = Boolean(user?.photoUrl) && !user.photoUrl.includes("ui-avatars.com");
  const hasSkills = Array.isArray(user?.skills) && user.skills.length > 0;
  const hasInterests = Array.isArray(user?.interests) && user.interests.length > 0;
  const hasBio = Boolean(user?.bio?.trim());
  const hasProjects = Array.isArray(user?.projects) && user.projects.length > 0;
  const completionChecks = [hasCustomPhoto, hasSkills, hasInterests, hasBio, hasProjects];
  const completionPercent = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);
  const firstName = user?.name?.split(" ")[0] || user?.name || "User";
  const initials = firstName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isActive = (path) => location.pathname === path;

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setProfileDropdown(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
  };

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      if (!user) {
        if (isMounted) setNotificationCount(0);
        return;
      }

      try {
        if (user.role === "admin") {
          const [pendingAlumniRes, pendingMentorshipRes] = await Promise.all([
            api.get("/admin/pending-alumni"),
            api.get("/admin/pending-mentorship")
          ]);
          if (!isMounted) return;
          const pendingAlumni = pendingAlumniRes.data?.alumni?.length || 0;
          const pendingMentorship = pendingMentorshipRes.data?.alumni?.length || 0;
          setNotificationCount(pendingAlumni + pendingMentorship);
          return;
        }

        if (user.role === "alumni") {
          const [pendingRequestsRes, profileRes] = await Promise.all([
            api.get("/connections/requests/pending"),
            api.get("/profile/me")
          ]);
          if (!isMounted) return;
          const connectionPending = pendingRequestsRes.data?.requests?.length || 0;
          const mentorshipStatus = profileRes.data?.user?.mentorshipStatus || "not_enrolled";
          const mentorshipPendingBadge = mentorshipStatus === "pending" ? 1 : 0;
          setNotificationCount(connectionPending + mentorshipPendingBadge);
          return;
        }

        const pendingRequestsRes = await api.get("/connections/requests/pending");
        if (!isMounted) return;
        setNotificationCount(pendingRequestsRes.data?.requests?.length || 0);
      } catch {
        if (isMounted) {
          setNotificationCount(0);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const publicNavLinks = [{ icon: <Users />, label: "About", href: "/about" }];

  const renderModernNavbar = ({ variant, notificationCount, links, dropdownItems, homeHref = "/" }) => (
    <nav className={`modern-navbar modern-navbar--${variant}`}>
      <div className="modern-navbar__inner">
        <Link className="modern-navbar__brand" to={homeHref}>
          <span className="modern-navbar__brand-icon">
            <FaGraduationCap />
          </span>
          <span className="modern-navbar__brand-text">GCE Connect</span>
        </Link>

        <button
          className="modern-navbar__toggle"
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FaXmark /> : <FaBars />}
        </button>

        <div className={`modern-navbar__collapse ${mobileMenuOpen ? "is-open" : ""}`}>
          <ul className="modern-navbar__links">
            {links.map((link) => (
              <li key={link.label} className="modern-navbar__item">
                <Link
                  to={link.href}
                  className={`modern-navbar__link ${isActive(link.href) ? "is-active" : ""}`}
                  onClick={closeMenus}
                >
                  <span className="modern-navbar__link-icon">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="modern-navbar__actions">
            <button type="button" className="modern-navbar__notify" aria-label="Notifications">
              <Bell size={15} />
              <span className="modern-navbar__notify-count">{notificationCount}</span>
            </button>

            <div className="modern-navbar__profile-wrap">
              <button
                className="modern-navbar__profile"
                type="button"
                onClick={() => setProfileDropdown((prev) => !prev)}
                aria-expanded={profileDropdown}
                aria-label="Open profile menu"
              >
                {hasCustomPhoto ? (
                  <img src={userAvatar} alt="Profile" className="modern-navbar__avatar" />
                ) : (
                  <span className="modern-navbar__avatar modern-navbar__avatar--initials">{initials}</span>
                )}
                <span className="modern-navbar__completion">{completionPercent}%</span>
                <span className="modern-navbar__greeting">Hi, {firstName}</span>
                <ChevronDown size={14} className="modern-navbar__chevron" />
              </button>

              {profileDropdown && (
                <div className="modern-navbar__dropdown">
                  {dropdownItems.map((item) =>
                    item.type === "link" ? (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="modern-navbar__dropdown-item"
                        onClick={closeMenus}
                      >
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </Link>
                    ) : (
                      <button
                        key={item.label}
                        type="button"
                        className={`modern-navbar__dropdown-item ${item.variant === "danger" ? "is-danger" : ""}`}
                        onClick={() => {
                          closeMenus();
                          item.onClick();
                        }}
                      >
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );

  if (!user) {
    return (
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">
            <FaGraduationCap />
          </span>
          <span className="brand-name">
            GCE <span className="brand-accent">Connect</span>
          </span>
        </Link>

        <ul className="nav-links">
          {publicNavLinks.map((link) => (
            <li key={link.label}>
              <Link
                to={link.href}
                className={`nav-link ${isActive(link.href) ? "nav-link--active" : ""}`}
                onClick={closeMenus}
              >
                <span className="nav-link-icon">{link.icon}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-auth">
          <Link to="/login" className="btn-signin">
            <FaArrowRightToBracket className="btn-icon" />
            Sign In
          </Link>
          <Link to="/register" className="btn-join">
            <FaUserPlus className="btn-icon" />
            Join
          </Link>
        </div>

        <button className="nav-toggle" onClick={() => setMobileMenuOpen((prev) => !prev)} aria-label="Toggle menu">
          {mobileMenuOpen ? <FaXmark /> : <FaBars />}
        </button>

        {mobileMenuOpen && (
          <div className="mobile-menu">
            <ul className="mobile-links">
              {publicNavLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className={`mobile-link ${isActive(link.href) ? "mobile-link--active" : ""}`}
                    onClick={closeMenus}
                  >
                    <span className="nav-link-icon">{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mobile-auth">
              <Link to="/login" className="btn-signin btn-signin--mobile" onClick={closeMenus}>
                <FaArrowRightToBracket className="btn-icon" /> Sign In
              </Link>
              <Link to="/register" className="btn-join btn-join--mobile" onClick={closeMenus}>
                <FaUserPlus className="btn-icon" /> Join
              </Link>
            </div>
          </div>
        )}
      </nav>
    );
  }

  if (user.role === "student") {
    return renderModernNavbar({
      variant: "student",
      notificationCount,
      links: [
        { icon: <Home size={16} />, label: "Home", href: "/" },
        { icon: <Users size={16} />, label: "Alumni", href: "/alumni" },
        { icon: <Briefcase size={16} />, label: "Jobs", href: "/jobs" },
        { icon: <Calendar size={16} />, label: "Events", href: "/events" },
        { icon: <FileText size={16} />, label: "Applications", href: "/my-applications" },
        { icon: <Users size={16} />, label: "Mentorship", href: "/connections" },
        { icon: <FileText size={16} />, label: "Donations", href: "/donations" }
      ],
      dropdownItems: [
        { type: "link", label: "Profile", href: "/profile", icon: User },
        { type: "link", label: "My Applications", href: "/my-applications", icon: FileText },
        { type: "link", label: "Settings", href: "/profile", icon: Settings },
        { type: "action", label: "Logout", icon: LogOut, variant: "danger", onClick: handleLogout }
      ]
    });
  }

  if (user.role === "alumni") {
    return renderModernNavbar({
      variant: "alumni",
      notificationCount,
      links: [
        { icon: <Home size={16} />, label: "Home", href: "/" },
        { icon: <Users size={16} />, label: "Alumni", href: "/alumni" },
        { icon: <Briefcase size={16} />, label: "Jobs", href: "/my-jobs" },
        { icon: <Calendar size={16} />, label: "Events", href: "/events" },
        { icon: <Briefcase size={16} />, label: "Mentorship", href: "/alumni-network" },
        { icon: <FileText size={16} />, label: "Donations", href: "/donations" }
      ],
      dropdownItems: [
        { type: "link", label: "Profile", href: "/profile", icon: User },
        { type: "link", label: "My Job Posts", href: "/my-jobs", icon: FileText },
        { type: "link", label: "Settings", href: "/profile", icon: Settings },
        { type: "action", label: "Logout", icon: LogOut, variant: "danger", onClick: handleLogout }
      ]
    });
  }

  if (user.role === "admin") {
    return renderModernNavbar({
      variant: "admin",
      notificationCount,
      homeHref: "/admin",
      links: [
        { icon: <Home size={16} />, label: "Analytics", href: "/admin" },
        { icon: <CheckSquare size={16} />, label: "Approve Alumni", href: "/approve-alumni" },
        { icon: <Briefcase size={16} />, label: "Manage Jobs", href: "/manage-jobs" },
        { icon: <Calendar size={16} />, label: "Manage Events", href: "/manage-events" },
        { icon: <Bell size={16} />, label: "Announcements", href: "/announcements" },
        { icon: <FileText size={16} />, label: "Donations", href: "/donations" }
      ],
      dropdownItems: [
        { type: "link", label: "Admin Profile", href: "/profile", icon: User },
        { type: "link", label: "Settings", href: "/profile", icon: Settings },
        { type: "action", label: "Logout", icon: LogOut, variant: "danger", onClick: handleLogout }
      ]
    });
  }

  return null;
};

export default NavBar;
