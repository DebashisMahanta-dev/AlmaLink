import React from "react";

const AdminDashboard = () => {
  return (
    <div className="container py-5">
      <h1 className="mb-4">Admin Dashboard</h1>
      <div className="row g-4">
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h3 className="card-title">5</h3>
              <p className="card-text text-muted">Pending Alumni</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h3 className="card-title">24</h3>
              <p className="card-text text-muted">Active Jobs</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h3 className="card-title">142</h3>
              <p className="card-text text-muted">Total Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h3 className="card-title">58</h3>
              <p className="card-text text-muted">Applications</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
