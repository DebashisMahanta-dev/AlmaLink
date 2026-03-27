import React from "react";

const ShareExperience = () => {
  return (
    <div className="container py-5">
      <h1 className="mb-4">Share Your Experience</h1>
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input type="text" className="form-control" placeholder="e.g., My Journey to Tech Leadership" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Content</label>
                  <textarea className="form-control" rows="7" placeholder="Share your experience, insights, and advice..."></textarea>
                </div>
                <button type="submit" className="btn btn-success">Share Experience</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareExperience;
