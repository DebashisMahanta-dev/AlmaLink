import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Calendar, MapPin, Clock, Users, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Events = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFormEventId, setActiveFormEventId] = useState("");
  const [submittingEventId, setSubmittingEventId] = useState("");
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    phone: "",
    note: ""
  });

  const loadEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/events");
      setEvents(res.data.events || []);
    } catch (err) {
      console.error("Failed to load events", err);
      setError(err?.response?.data?.message || "Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const applyEventUpdate = (updatedEvent) => {
    setEvents((prev) =>
      prev.map((entry) => (entry._id === updatedEvent._id ? { ...entry, ...updatedEvent } : entry))
    );
  };

  const openRegisterForm = (event) => {
    setActiveFormEventId(event._id);
    setFormState({
      fullName: user?.name || "",
      email: user?.email || "",
      phone: "",
      note: ""
    });
  };

  const handleRegister = async (eventId) => {
    setSubmittingEventId(eventId);
    try {
      const res = await api.post(`/events/${eventId}/register`, formState);
      if (res?.data?.event) {
        applyEventUpdate(res.data.event);
      }
      toast.success(res?.data?.message || "Registered successfully");
      setActiveFormEventId("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to register for event");
    } finally {
      setSubmittingEventId("");
    }
  };

  const handleUnregister = async (eventId) => {
    setSubmittingEventId(eventId);
    try {
      const res = await api.delete(`/events/${eventId}/register`);
      if (res?.data?.event) {
        applyEventUpdate(res.data.event);
      }
      toast.info(res?.data?.message || "Registration cancelled");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel registration");
    } finally {
      setSubmittingEventId("");
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-2">Upcoming Events</h2>
        <p className="text-muted">Connect with alumni and expand your network</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} className="me-2" />
          {error}
        </div>
      ) : (
        <div className="row g-4">
          {events.map((event) => {
            const startsAt = new Date(event.startsAt);
            const day = startsAt.toLocaleDateString(undefined, { day: "2-digit" });
            const month = startsAt.toLocaleDateString(undefined, { month: "short" }).toUpperCase();
            const time = startsAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

            return (
              <div key={event._id} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                  <div
                    className="p-4 text-white d-flex align-items-end"
                    style={{
                      minHeight: "180px",
                      background:
                        event.imageUrl
                          ? `linear-gradient(180deg, rgba(10,17,32,0.08), rgba(10,17,32,0.58)), url(${event.imageUrl}) center/cover`
                          : "linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)"
                    }}
                  >
                    <div>
                      <div className="badge bg-light text-dark rounded-pill mb-2 px-3 py-2">
                        {event.rsvpLabel || event.format || "Event"}
                      </div>
                      <h5 className="card-title fw-bold mb-0">{event.title}</h5>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-center text-muted mb-2">
                      <Calendar size={16} className="me-2" />
                      <small>
                        {month} {day}, {startsAt.getFullYear()}
                      </small>
                    </div>

                    <div className="d-flex align-items-center text-muted mb-2">
                      <Clock size={16} className="me-2" />
                      <small>{time}</small>
                    </div>

                    <div className="d-flex align-items-center text-muted mb-2">
                      <MapPin size={16} className="me-2" />
                      <small>{event.location || event.format || "Online"}</small>
                    </div>

                    <div className="d-flex align-items-center text-muted mb-3">
                      <Users size={16} className="me-2" />
                      <small>{event.attendingCount || 0} attending</small>
                    </div>

                    {event.isRegistered ? (
                      <div className="d-grid gap-2">
                        <button className="btn btn-success w-100" type="button" disabled>
                          Registered
                        </button>
                        <button
                          className="btn btn-outline-danger w-100"
                          type="button"
                          disabled={submittingEventId === event._id}
                          onClick={() => handleUnregister(event._id)}
                        >
                          {submittingEventId === event._id ? "Cancelling..." : "Cancel Registration"}
                        </button>
                      </div>
                    ) : activeFormEventId === event._id ? (
                      <div className="border rounded-3 p-3 bg-light">
                        <div className="mb-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Full name"
                            value={formState.fullName}
                            onChange={(e) => setFormState((prev) => ({ ...prev, fullName: e.target.value }))}
                          />
                        </div>
                        <div className="mb-2">
                          <input
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            value={formState.email}
                            onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div className="mb-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Phone (optional)"
                            value={formState.phone}
                            onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div className="mb-3">
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Note (optional)"
                            value={formState.note}
                            onChange={(e) => setFormState((prev) => ({ ...prev, note: e.target.value }))}
                          />
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary flex-fill"
                            type="button"
                            disabled={
                              submittingEventId === event._id ||
                              !formState.fullName.trim() ||
                              !formState.email.trim()
                            }
                            onClick={() => handleRegister(event._id)}
                          >
                            {submittingEventId === event._id ? "Submitting..." : "Submit Registration"}
                          </button>
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            disabled={submittingEventId === event._id}
                            onClick={() => setActiveFormEventId("")}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn btn-primary w-100" type="button" onClick={() => openRegisterForm(event)}>
                        Register
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {events.length === 0 && (
            <div className="col-12">
              <div className="text-center py-5">
                <Calendar size={64} className="text-muted mb-3" />
                <p className="text-muted">No upcoming events at the moment</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Events;
