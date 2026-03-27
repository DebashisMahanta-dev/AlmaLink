import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Briefcase, Users, Calendar } from "lucide-react";

const Landing = () => {
  const { user } = useAuth();

  if (user) {
    return null;
  }

  return (
    <div className="landing-page">
      {/* Hero Section with Background */}
      <section className="hero-section" style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "500px",
        display: "flex",
        alignItems: "center",
        color: "white"
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
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
      <footer className="py-5 bg-dark text-white" style={{ borderTop: "1px solid #333" }}>
        <div className="container">
          <div className="row mb-4">
            <div className="col-md-3">
              <h6 className="fw-bold mb-3">About Us</h6>
              <p className="small" style={{ color: "#ccc", lineHeight: "1.6" }}>
                A private platform for Government College of Engineering students and alumni.
              </p>
            </div>
            <div className="col-md-3">
              <h6 className="fw-bold mb-3">Contact</h6>
              <p className="small" style={{ color: "#ccc" }}>
                <a href="mailto:support@alumnconnect.com" style={{ color: "#ccc", textDecoration: "none" }}>
                  support@alumnconnect.com
                </a>
              </p>
            </div>
            <div className="col-md-3">
              <h6 className="fw-bold mb-3">Privacy</h6>
              <p className="small" style={{ color: "#ccc" }}>
                <a href="#" style={{ color: "#ccc", textDecoration: "none" }}>Privacy Policy</a>
              </p>
            </div>
            <div className="col-md-3">
              <h6 className="fw-bold mb-3">Terms</h6>
              <p className="small" style={{ color: "#ccc" }}>
                <a href="#" style={{ color: "#ccc", textDecoration: "none" }}>Terms of Service</a>
              </p>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #444", paddingTop: "20px" }} className="text-center">
            <p className="small mb-0" style={{ color: "#999" }}>
              &copy; 2026 GCE Connect | Government College of Engineering. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
