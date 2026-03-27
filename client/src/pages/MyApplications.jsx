import React from "react";

const MyApplications = () => {
  return (
    <div className="container py-5">
      <h1 className="mb-4">My Applications</h1>
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body text-center py-5">
              <p className="text-muted">You haven't applied to any jobs yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
