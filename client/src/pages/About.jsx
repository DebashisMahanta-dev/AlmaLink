import React from "react";

const About = () => {
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <h1 className="mb-4">About AlmaLink</h1>
          
          <section className="mb-5">
            <h3 className="mb-3">Our Mission</h3>
            <p className="lead">
              AlmaLink is a digital bridge between current students and alumni of our institution. 
              We believe in fostering strong connections that create lasting professional networks and 
              provide invaluable mentorship opportunities.
            </p>
          </section>

          <section className="mb-5">
            <h3 className="mb-3">What We Do</h3>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <strong>Connect Alumni with Students:</strong> Build meaningful professional relationships across generations.
              </li>
              <li className="list-group-item">
                <strong>Share Opportunities:</strong> Alumni post job and internship opportunities exclusively for our community.
              </li>
              <li className="list-group-item">
                <strong>Provide Mentorship:</strong> Experienced professionals guide students through career development.
              </li>
              <li className="list-group-item">
                <strong>Build Community:</strong> Foster a strong alumni network that supports each member's growth.
              </li>
            </ul>
          </section>

          <section className="mb-5">
            <h3 className="mb-3">Key Features</h3>
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="card border-0 h-100">
                  <div className="card-body">
                    <h5 className="card-title">👥 Alumni Directory</h5>
                    <p className="card-text">
                      Search and connect with alumni by graduation year, branch, company, and location.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card border-0 h-100">
                  <div className="card-body">
                    <h5 className="card-title">💼 Job Opportunities</h5>
                    <p className="card-text">
                      Discover exclusive job and internship postings from alumni at leading companies.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card border-0 h-100">
                  <div className="card-body">
                    <h5 className="card-title">💬 Direct Messaging</h5>
                    <p className="card-text">
                      Connect directly with alumni through our in-app messaging system.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card border-0 h-100">
                  <div className="card-body">
                    <h5 className="card-title">✅ Admin Moderation</h5>
                    <p className="card-text">
                      Our admin team ensures a safe and professional community for all members.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-5">
            <h3 className="mb-3">Who Can Join?</h3>
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="card border-left-primary h-100">
                  <div className="card-body">
                    <h5 className="card-title">🎓 Students</h5>
                    <p className="card-text">
                      Current students looking to explore career opportunities and connect with experienced professionals.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card border-left-success h-100">
                  <div className="card-body">
                    <h5 className="card-title">🧑‍💼 Alumni</h5>
                    <p className="card-text">
                      Graduates of our institution willing to share opportunities and mentor the next generation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-5">
            <h3 className="mb-3">Get Started</h3>
            <p>
              Ready to join our community? Register your account today and start connecting with fellow alumni 
              and discovering exciting opportunities.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
