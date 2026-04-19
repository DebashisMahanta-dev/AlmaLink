import React from "react";
import {
  FaShieldHalved,
  FaBullseye,
  FaGears,
  FaStar,
  FaUsers,
  FaQuoteLeft,
  FaHandshake,
  FaBriefcase,
  FaChalkboardUser,
  FaPeopleGroup,
  FaAddressBook,
  FaBagShopping,
  FaComments,
  FaUserShield,
  FaGraduationCap,
  FaUserTie,
  FaArrowRight,
  FaUserPlus,
  FaCirclePlay
} from "react-icons/fa6";
import "./AboutUs.css";

const whatWeDoItems = [
  {
    icon: <FaHandshake />,
    title: "Connect alumni with students",
    desc: "Build meaningful professional relationships across generations of GCE graduates."
  },
  {
    icon: <FaBriefcase />,
    title: "Share opportunities",
    desc: "Alumni post exclusive job and internship openings available only to our community."
  },
  {
    icon: <FaChalkboardUser />,
    title: "Provide mentorship",
    desc: "Experienced professionals guide students through every step of career development."
  },
  {
    icon: <FaPeopleGroup />,
    title: "Build community",
    desc: "Foster a strong college community that supports the growth of every member."
  }
];

const keyFeatures = [
  {
    icon: <FaAddressBook />,
    title: "Alumni directory",
    desc: "Search alumni by graduation year, branch, company, and location."
  },
  {
    icon: <FaBagShopping />,
    title: "Job opportunities",
    desc: "Exclusive internship and job postings from alumni at top companies."
  },
  {
    icon: <FaComments />,
    title: "Direct messaging",
    desc: "Connect one-on-one with alumni through our in-app messaging system."
  },
  {
    icon: <FaUserShield />,
    title: "Admin moderation",
    desc: "A dedicated team ensures a safe, private, and professional space for all."
  }
];

export default function About() {
  return (
    <div className="about-wrapper">
      <section className="hero">
        <div className="hero-badge">
          <FaShieldHalved className="badge-icon" />
          Private &amp; Verified Community
        </div>
        <h1>
          Welcome to <span className="hero-highlight">GCE Connect</span>
        </h1>
        <p className="hero-sub">
          A private digital bridge between current students and alumni of Government College of
          Engineering - fostering connections that last a lifetime.
        </p>
        <div className="hero-btns">
          <button className="btn-primary">
            <FaUserPlus className="btn-icon" /> Get started
          </button>
          <button className="btn-outline">
            <FaCirclePlay className="btn-icon" /> Learn more
          </button>
        </div>
      </section>

      <section className="section">
        <p className="section-label">
          <FaBullseye className="label-icon" /> Our mission
        </p>
        <h2 className="section-title">Why we exist</h2>
        <p className="section-desc">
          We believe strong alumni-student connections create lasting professional relationships
          and provide invaluable mentorship opportunities.
        </p>
        <div className="mission-card">
          <div className="mission-icon">
            <FaQuoteLeft />
          </div>
          <p>
            GCE Connect exists to foster strong connections that create lasting professional
            relationships and provide invaluable mentorship opportunities - bridging the gap
            between experience and ambition.
          </p>
        </div>
      </section>

      <div className="divider" />

      <section className="section">
        <p className="section-label">
          <FaGears className="label-icon" /> What we do
        </p>
        <h2 className="section-title">How we help you grow</h2>
        <div className="what-grid">
          {whatWeDoItems.map((item, i) => (
            <div className="what-card" key={i}>
              <div className="what-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section className="section">
        <p className="section-label">
          <FaStar className="label-icon" /> Key features
        </p>
        <h2 className="section-title">Everything you need</h2>
        <div className="features-grid">
          {keyFeatures.map((item, i) => (
            <div className="feature-card" key={i}>
              <span className="feature-icon">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section className="section">
        <p className="section-label">
          <FaUsers className="label-icon" /> Who can join
        </p>
        <h2 className="section-title">Made for our community</h2>
        <div className="who-row">
          <div className="who-card">
            <div className="who-avatar student">
              <FaGraduationCap />
            </div>
            <h3>Students</h3>
            <p>
              Current students looking to explore career opportunities and connect with experienced
              professionals from GCE.
            </p>
          </div>
          <div className="who-card">
            <div className="who-avatar alumni">
              <FaUserTie />
            </div>
            <h3>Alumni</h3>
            <p>
              Graduates of our institution willing to share their expertise, post opportunities,
              and mentor the next generation of engineers.
            </p>
          </div>
        </div>
      </section>

      <div className="cta-strip">
        <h2>Ready to join the community?</h2>
        <p>
          Register today and start connecting with fellow students and alumni - discover
          opportunities built just for you.
        </p>
        <button className="btn-primary">
          <FaArrowRight className="btn-icon" /> Register now
        </button>
      </div>
    </div>
  );
}
