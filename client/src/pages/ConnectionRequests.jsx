import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Check, X, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ConnectionRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("received");

  const connectionStats = connections.reduce(
    (acc, connection) => {
      const role = connection?.connectedUser?.role;
      acc.total += 1;
      if (role === "student") acc.students += 1;
      if (role === "alumni") acc.alumni += 1;
      return acc;
    },
    { total: 0, students: 0, alumni: 0 }
  );

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [pendingRes, sentRes, connectionsRes] = await Promise.all([
        api.get("/connections/requests/pending"),
        api.get("/connections/requests/sent"),
        api.get("/connections")
      ]);

      setPendingRequests(pendingRes.data.requests || []);
      setSentRequests(sentRes.data.requests || []);
      setConnections(connectionsRes.data.connections || []);
    } catch (err) {
      console.error("Failed to load connection data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      await api.patch(`/connections/request/${connectionId}/accept`);
      loadAllData();
    } catch (err) {
      console.error("Failed to accept request", err);
    }
  };

  const handleReject = async (connectionId) => {
    try {
      await api.patch(`/connections/request/${connectionId}/reject`);
      loadAllData();
    } catch (err) {
      console.error("Failed to reject request", err);
    }
  };

  const handleCancelSent = async (connectionId) => {
    try {
      await api.delete(`/connections/request/${connectionId}`);
      loadAllData();
    } catch (err) {
      console.error("Failed to cancel request", err);
    }
  };

  const handleMessageClick = (connectedUser) => {
    navigate("/messages", { state: { selectedUserId: connectedUser._id, selectedUserName: connectedUser.name } });
  };

  if (loading) {
    return <div className="container py-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", paddingBottom: "40px" }}>
      <div className="container py-4">
        <div className="row mb-4">
          <div className="col-md-8">
            <h2 className="fw-bold mb-2">
              <UserPlus size={24} className="me-2" />
              Connections & Requests
            </h2>
            <p className="text-muted">Manage your connection requests and current connections</p>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="bg-white rounded p-3 shadow-sm border">
              <div className="text-muted small">Total Connections</div>
              <div className="fw-bold fs-4">{connectionStats.total}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="bg-white rounded p-3 shadow-sm border">
              <div className="text-muted small">Student Connections</div>
              <div className="fw-bold fs-4">{connectionStats.students}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="bg-white rounded p-3 shadow-sm border">
              <div className="text-muted small">Alumni Connections</div>
              <div className="fw-bold fs-4">{connectionStats.alumni}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded p-2 mb-4 shadow-sm">
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={`btn ${activeTab === "received" ? "btn-primary" : "btn-outline-secondary"} flex-fill`}
              onClick={() => setActiveTab("received")}
            >
              <Inbox size={16} className="me-2" />
              Received ({pendingRequests.length})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === "sent" ? "btn-primary" : "btn-outline-secondary"} flex-fill`}
              onClick={() => setActiveTab("sent")}
            >
              Sent ({sentRequests.length})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === "connections" ? "btn-primary" : "btn-outline-secondary"} flex-fill`}
              onClick={() => setActiveTab("connections")}
            >
              Connections ({connections.length})
            </button>
          </div>
        </div>

        {/* Received Requests */}
        {activeTab === "received" && (
          <div className="row g-3">
            {pendingRequests.length === 0 ? (
              <div className="col-12">
                <div className="text-center py-5 bg-white rounded">
                  <Inbox size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No pending requests</h5>
                  <p className="text-muted">You'll see new connection requests here</p>
                </div>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div key={request._id} className="col-md-6 col-lg-4">
                  <div className="bg-white rounded p-4 shadow-sm h-100 d-flex flex-column">
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={`https://i.pravatar.cc/48?u=${request.sender.email}`}
                        alt={request.sender.name}
                        className="rounded-circle me-3"
                        style={{ width: "48px", height: "48px", objectFit: "cover" }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-0">{request.sender.name}</h6>
                        <small className="text-muted">{request.sender.email}</small>
                      </div>
                    </div>

                    {request.message && (
                      <p className="small text-muted mb-3">"{request.message}"</p>
                    )}

                    <div className="mt-auto d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success flex-grow-1"
                        onClick={() => handleAccept(request._id)}
                      >
                        <Check size={16} className="me-1" />
                        Accept
                      </button>
                      <button
                        className="btn btn-sm btn-danger flex-grow-1"
                        onClick={() => handleReject(request._id)}
                      >
                        <X size={16} className="me-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Sent Requests */}
        {activeTab === "sent" && (
          <div className="row g-3">
            {sentRequests.length === 0 ? (
              <div className="col-12">
                <div className="text-center py-5 bg-white rounded">
                  <UserPlus size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No sent requests</h5>
                  <p className="text-muted">Send connection requests to start connecting</p>
                </div>
              </div>
            ) : (
              sentRequests.map((request) => (
                <div key={request._id} className="col-md-6 col-lg-4">
                  <div className="bg-white rounded p-4 shadow-sm h-100 d-flex flex-column">
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={`https://i.pravatar.cc/48?u=${request.receiver.email}`}
                        alt={request.receiver.name}
                        className="rounded-circle me-3"
                        style={{ width: "48px", height: "48px", objectFit: "cover" }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-0">{request.receiver.name}</h6>
                        <small className="text-muted">{request.receiver.email}</small>
                      </div>
                    </div>

                    <div className="alert alert-info mb-3 small">
                      <strong>Pending</strong> - Waiting for response
                    </div>

                    <div className="mt-auto">
                      <button
                        className="btn btn-sm btn-outline-danger w-100"
                        onClick={() => handleCancelSent(request._id)}
                      >
                        <X size={16} className="me-1" />
                        Cancel Request
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Connections */}
        {activeTab === "connections" && (
          <div className="row g-3">
            {connections.length === 0 ? (
              <div className="col-12">
                <div className="text-center py-5 bg-white rounded">
                  <UserPlus size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No connections yet</h5>
                  <p className="text-muted">Accept requests to start making connections</p>
                </div>
              </div>
            ) : (
              connections.map((connection) => (
                <div key={connection._id} className="col-md-6 col-lg-4">
                  <div className="bg-white rounded p-4 shadow-sm h-100 d-flex flex-column">
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={`https://i.pravatar.cc/48?u=${connection.connectedUser.email}`}
                        alt={connection.connectedUser.name}
                        className="rounded-circle me-3"
                        style={{ width: "48px", height: "48px", objectFit: "cover" }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-0">{connection.connectedUser.name}</h6>
                        <small className="text-muted">{connection.connectedUser.email}</small>
                      </div>
                    </div>

                    <div className="small text-muted mb-3">
                      Connected since: {new Date(connection.connectedAt).toLocaleDateString()}
                    </div>

                    <div className="mt-auto">
                      <button
                        className="btn btn-sm btn-primary w-100"
                        onClick={() => handleMessageClick(connection.connectedUser)}
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionRequests;
