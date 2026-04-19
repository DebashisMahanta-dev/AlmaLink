import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  Users,
  Calendar,
  Sparkles,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";

const Landing = () => {
  const { user } = useAuth();

  if (user) {
    return null;
  }

  return (
    <div className="landing-page">
      {/* Hero Section with Video Background */}
      <section className="hero-section hero-section--video">
        <video className="hero-video" autoPlay muted loop playsInline preload="auto">
          <source src="/Herosection.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <div className="container hero-content">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="display-3 fw-bold mb-3">Government College of Engineering<br />Alumni and Student Portal</h1>
              <p className="lead mb-4">
                A private community to unlock career opportunities, mentorship, and collaboration
              </p>
              <div className="d-flex gap-3 mb-5">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Find Jobs & Mentors
                </Link>
                <Link to="/register" className="btn btn-success btn-lg">
                  Share Your Experience
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="features-section py-5">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">Key Features</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 text-center p-4">
                <div className="mb-3">
                  <Briefcase size={48} className="text-primary" />
                </div>
                <h5 className="card-title fw-bold">Job Board</h5>
                <p className="card-text text-muted">
                  Exclusive opportunities from trusted alumni
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 text-center p-4">
                <div className="mb-3">
                  <Users size={48} className="text-info" />
                </div>
                <h5 className="card-title fw-bold">Mentorship Network</h5>
                <p className="card-text text-muted">
                  Get guidance, give back, and grow
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 text-center p-4">
                <div className="mb-3">
                  <Calendar size={48} className="text-success" />
                </div>
                <h5 className="card-title fw-bold">Events & Webinars</h5>
                <p className="card-text text-muted">
                  Stay informed, connected, and inspired
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="success-stories py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">Success Stories</h2>
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces" 
                alt="Alumni" 
                className="rounded-circle mb-3" 
                width="120" 
                height="120"
              />
              <p className="fst-italic text-muted">
                "Found my dream job through GCE Connect. The process was seamless!"
              </p>
              <p className="fw-bold">Sarah L. (Class of '18)</p>
            </div>

            <div className="col-md-4 text-center">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces" 
                alt="Alumni" 
                className="rounded-circle mb-3" 
                width="120" 
                height="120"
              />
              <p className="fst-italic text-muted">
                "Mentorship changed my career path. Great community here!"
              </p>
              <p className="fw-bold">Alex T. (Current Student)</p>
            </div>

            <div className="col-md-4 text-center">
              <img 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces" 
                alt="Alumni" 
                className="rounded-circle mb-3" 
                width="120" 
                height="120"
              />
              <p className="fst-italic text-muted">
                "Hired 3 talented individuals from here. Love giving back!"
              </p>
              <p className="fw-bold">Maria P. (Class of '15)</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="mb-4">Ready to Get Started?</h2>
          <p className="lead mb-4">
            Join Government College of Engineering students and alumni working together to shape the future.
          </p>
          <Link to="/register" className="btn btn-light btn-lg me-3">
            Create Account
          </Link>
          <Link to="/login" className="btn btn-outline-light btn-lg">
            Already a member?
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer landing-footer--light">
        <div className="container">
          <div className="landing-footer__grid">
            <div className="landing-footer__brand">
              <span className="landing-footer__eyebrow">
                <Sparkles size={14} />
                GCE Connect
              </span>
              <h3 className="landing-footer__title">Building stronger alumni and student connections.</h3>
              <p className="landing-footer__description">
                Government College of Engineering's private community for jobs, mentorship, events, and meaningful
                alumni engagement.
              </p>
              <div className="landing-footer__socials">
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <Linkedin size={18} />
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
                <a href="https://www.twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                  <Twitter size={18} />
                </a>
              </div>
            </div>

            <div className="landing-footer__column">
              <h6>Products</h6>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/jobs">Jobs</Link>
              <Link to="/events">Events</Link>
              <Link to="/messages">Messages</Link>
            </div>

            <div className="landing-footer__column">
              <h6>Resources</h6>
              <Link to="/about">About Us</Link>
              <Link to="/alumni-directory">Alumni Directory</Link>
              <Link to="/alumni-network">Community</Link>
              <Link to="/profile">Profile</Link>
            </div>

            <div className="landing-footer__column">
              <h6>Company</h6>
              <Link to="/about">Mission</Link>
              <Link to="/about">Contact</Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Government+College+of+Engineering"
                target="_blank"
                rel="noreferrer"
              >
                Campus Map
              </a>
              <Link to="/about">FAQs</Link>
            </div>

          </div>

          <div className="landing-footer__bottom landing-footer__bottom--light">
            <p>&copy; 2026 GCE Connect | Government College of Engineering. All rights reserved.</p>
            <div className="landing-footer__bottom-links">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/terms-of-service">Terms of Service</Link>
              <Link to="/cookie-policy">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
