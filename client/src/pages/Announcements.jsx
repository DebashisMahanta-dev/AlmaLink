import React from "react";

const Announcements = () => {
  return (
    <div className="container py-5">
      <h1 className="mb-4">Announcements</h1>
      <div className="row mb-4">
        <div className="col-md-12">
          <button className="btn btn-primary">+ New Announcement</button>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body text-center py-5">
              <p className="text-muted">No announcements posted yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
