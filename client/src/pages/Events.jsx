import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Calendar, MapPin, Clock, Users, AlertCircle } from "lucide-react";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    loadEvents();
  }, []);

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

                    <button className="btn btn-primary w-100" type="button">
                      Register
                    </button>
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
