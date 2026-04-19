import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Edit3,
  ExternalLink,
  Globe2,
  ImageIcon,
  MapPin,
  PlusCircle,
  RefreshCw,
  Save,
  Trash2,
  Users
} from "lucide-react";

const initialForm = {
  title: "",
  startsAt: "",
  location: "",
  format: "Online",
  attendingCount: 0,
  rsvpLabel: "",
  imageUrl: "",
  active: true
};

const toLocalInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
};

const ManageEvents = () => {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const isEditing = Boolean(editingId);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/events");
      setEvents(res.data.events || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  }, [events]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const startEdit = (event) => {
    setEditingId(event._id);
    setForm({
      title: event.title || "",
      startsAt: toLocalInputValue(event.startsAt),
      location: event.location || "",
      format: event.format || "Online",
      attendingCount: event.attendingCount ?? 0,
      rsvpLabel: event.rsvpLabel || "",
      imageUrl: event.imageUrl || "",
      active: event.active ?? true
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusyId("form");
    setError("");
    try {
      if (!form.title.trim() || !form.startsAt) {
        throw new Error("Title and event date/time are required");
      }

      const payload = {
        ...form,
        attendingCount: Number(form.attendingCount) || 0
      };

      if (isEditing) {
        const res = await api.patch(`/admin/events/${editingId}`, payload);
        const updated = res.data.event;
        setEvents((current) => current.map((item) => (item._id === updated._id ? updated : item)));
        toast.success("Event updated successfully");
      } else {
        const res = await api.post("/admin/events", payload);
        const created = res.data.event;
        setEvents((current) => [created, ...current]);
        toast.success("Event created successfully");
      }

      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to save event");
      toast.error(err?.response?.data?.message || err.message || "Failed to save event");
    } finally {
      setBusyId("");
    }
  };

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm("Delete this event? This action cannot be undone.");
    if (!confirmed) return;

    setBusyId(eventId);
    setError("");
    try {
      await api.delete(`/admin/events/${eventId}`);
      setEvents((current) => current.filter((event) => event._id !== eventId));
      toast.success("Event deleted successfully");
      if (editingId === eventId) {
        resetForm();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete event");
      toast.error(err?.response?.data?.message || "Failed to delete event");
    } finally {
      setBusyId("");
    }
  };

  const toggleActive = async (event) => {
    setBusyId(event._id);
    try {
      const res = await api.patch(`/admin/events/${event._id}`, { active: !event.active });
      const updated = res.data.event;
      setEvents((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      toast.success(updated.active ? "Event published" : "Event hidden");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update event status");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 28%), radial-gradient(circle at top right, rgba(16, 185, 129, 0.10), transparent 24%), linear-gradient(135deg, #eef4fb 0%, #f7fafc 100%)",
        paddingBottom: "40px"
      }}
    >
      <div className="container py-4">
        <div
          className="rounded-4 p-4 p-md-5 mb-4 position-relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 55%, #eef6ff 100%)",
            border: "1px solid #dbeafe",
            boxShadow: "0 18px 40px rgba(14, 30, 37, 0.06)"
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "auto -50px -40px auto",
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)"
            }}
          />
          <div className="position-relative">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <span className="badge rounded-pill px-3 py-2 text-bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-2">
                <CalendarDays size={14} />
                Admin events board
              </span>
              <span className="badge rounded-pill px-3 py-2 text-bg-light text-secondary border">
                {events.length} events
              </span>
            </div>

            <h1 className="fw-bold mb-2" style={{ fontSize: "clamp(2rem, 4vw, 2.9rem)", letterSpacing: "-0.03em" }}>
              Manage Events
            </h1>
            <p className="text-muted mb-0" style={{ maxWidth: "44rem", fontSize: "1.05rem" }}>
              Create, edit, publish, or hide official events from one place. These events will appear on the public Events page and
              dashboard widgets.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4" role="alert">
            <AlertCircle size={18} className="me-2" />
            {error}
          </div>
        )}

        <div className="row g-4">
          <div className="col-12 col-xl-5">
            <div className="rounded-4 p-4 h-100 bg-white border border-1 shadow-sm">
              <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                <div>
                  <h4 className="fw-bold mb-1">{isEditing ? "Edit Event" : "New Event"}</h4>
                  <p className="text-muted mb-0">Fill the form and publish the event to the platform.</p>
                </div>
                {isEditing && (
                  <button className="btn btn-outline-secondary rounded-pill" type="button" onClick={resetForm}>
                    Reset
                  </button>
                )}
              </div>

              <form className="d-grid gap-3" onSubmit={handleSubmit}>
                <div>
                  <label className="form-label fw-semibold">Event title</label>
                  <input
                    type="text"
                    className="form-control rounded-4 py-3"
                    placeholder="Alumni Meetup 2026"
                    value={form.title}
                    onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="form-label fw-semibold">Starts at</label>
                  <input
                    type="datetime-local"
                    className="form-control rounded-4 py-3"
                    value={form.startsAt}
                    onChange={(e) => setForm((current) => ({ ...current, startsAt: e.target.value }))}
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Format</label>
                    <select
                      className="form-select rounded-4 py-3"
                      value={form.format}
                      onChange={(e) => setForm((current) => ({ ...current, format: e.target.value }))}
                    >
                      <option value="Online">Online</option>
                      <option value="In-person">In-person</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Attending count</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control rounded-4 py-3"
                      value={form.attendingCount}
                      onChange={(e) => setForm((current) => ({ ...current, attendingCount: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label fw-semibold">Location</label>
                  <input
                    type="text"
                    className="form-control rounded-4 py-3"
                    placeholder="GCE Auditorium"
                    value={form.location}
                    onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="form-label fw-semibold">RSVP label</label>
                  <input
                    type="text"
                    className="form-control rounded-4 py-3"
                    placeholder="RSVP Open"
                    value={form.rsvpLabel}
                    onChange={(e) => setForm((current) => ({ ...current, rsvpLabel: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="form-label fw-semibold">Image URL</label>
                  <input
                    type="url"
                    className="form-control rounded-4 py-3"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={(e) => setForm((current) => ({ ...current, imageUrl: e.target.value }))}
                  />
                  <div className="form-text">Optional. Add a banner image for the event card.</div>
                </div>

                <div className="d-flex align-items-center justify-content-between rounded-4 px-3 py-3" style={{ background: "#f8fbff" }}>
                  <div>
                    <div className="fw-semibold">Publish now</div>
                    <small className="text-muted">Uncheck to keep the event hidden from public pages.</small>
                  </div>
                  <div className="form-check form-switch m-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={form.active}
                      onChange={(e) => setForm((current) => ({ ...current, active: e.target.checked }))}
                    />
                  </div>
                </div>

                <button className="btn btn-primary rounded-pill py-3 d-inline-flex align-items-center justify-content-center gap-2" type="submit" disabled={busyId === "form"}>
                  {busyId === "form" ? (
                    <>
                      <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                      Saving...
                    </>
                  ) : isEditing ? (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} />
                      Create Event
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="col-12 col-xl-7">
            <div className="rounded-4 p-4 bg-white border border-1 shadow-sm">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
                <div>
                  <h4 className="fw-bold mb-1">Published Events</h4>
                  <p className="text-muted mb-0">Manage the active event list shown to users.</p>
                </div>
                <button className="btn btn-outline-primary rounded-pill d-inline-flex align-items-center gap-2" type="button" onClick={loadEvents}>
                  <RefreshCw size={15} />
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="text-muted">Loading events...</div>
                </div>
              ) : sortedEvents.length === 0 ? (
                <div className="text-center py-5 rounded-4" style={{ background: "linear-gradient(180deg, #fbfcfe 0%, #f7f9fc 100%)", border: "1px dashed #d8e0ea" }}>
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: 80, height: 80, background: "#f2f6ff", color: "#94a3b8" }}>
                    <CalendarDays size={36} />
                  </div>
                  <h5 className="fw-semibold mb-2">No events yet</h5>
                  <p className="text-muted mb-0">Create the first official event using the form on the left.</p>
                </div>
              ) : (
                <div className="d-grid gap-3">
                  {sortedEvents.map((event) => {
                    const startsAt = new Date(event.startsAt);
                    const formattedDate = startsAt.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });
                    const formattedTime = startsAt.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit"
                    });

                    return (
                      <div
                        key={event._id}
                        className="rounded-4 p-4"
                        style={{
                          background: "#fff",
                          border: "1px solid #e3e8ef",
                          boxShadow: "0 12px 24px rgba(14, 30, 37, 0.05)"
                        }}
                      >
                        <div className="d-flex justify-content-between gap-3 align-items-start flex-wrap mb-3">
                          <div className="d-flex gap-3">
                            <div
                              className="rounded-4 d-flex align-items-center justify-content-center text-center fw-bold"
                              style={{ width: 72, minWidth: 72, height: 72, background: "#f4f7ff", color: "#1d4ed8", border: "1px solid #dbeafe" }}
                            >
                              <div>
                                <div style={{ fontSize: "1.1rem", lineHeight: 1 }}>{startsAt.getDate()}</div>
                                <div style={{ fontSize: "0.72rem", letterSpacing: "0.08em" }}>{startsAt.toLocaleDateString(undefined, { month: "short" }).toUpperCase()}</div>
                              </div>
                            </div>

                            <div>
                              <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                                <span className={`badge rounded-pill px-3 py-2 ${event.active ? "text-bg-success-subtle text-success border border-success-subtle" : "text-bg-light text-secondary border"}`}>
                                  <BadgeCheck size={13} className="me-1" />
                                  {event.active ? "Published" : "Hidden"}
                                </span>
                                <span className="badge rounded-pill px-3 py-2 text-bg-light text-secondary border">
                                  {event.rsvpLabel || event.format || "Event"}
                                </span>
                              </div>
                              <h5 className="fw-bold mb-1">{event.title}</h5>
                              <div className="d-flex flex-wrap align-items-center gap-3 text-muted small">
                                <span className="d-inline-flex align-items-center gap-1">
                                  <Clock3 size={14} />
                                  {formattedDate} at {formattedTime}
                                </span>
                                {event.location && (
                                  <span className="d-inline-flex align-items-center gap-1">
                                    <MapPin size={14} />
                                    {event.location}
                                  </span>
                                )}
                                <span className="d-inline-flex align-items-center gap-1">
                                  <Users size={14} />
                                  {event.attendingCount || 0} attending
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex gap-2">
                            <button className="btn btn-outline-primary rounded-pill d-inline-flex align-items-center gap-2" type="button" onClick={() => startEdit(event)}>
                              <Edit3 size={14} />
                              Edit
                            </button>
                            <button
                              className={`btn rounded-pill d-inline-flex align-items-center gap-2 ${event.active ? "btn-outline-secondary" : "btn-outline-success"}`}
                              type="button"
                              onClick={() => toggleActive(event)}
                              disabled={busyId === event._id}
                            >
                              <Globe2 size={14} />
                              {event.active ? "Hide" : "Publish"}
                            </button>
                            <button className="btn btn-outline-danger rounded-pill d-inline-flex align-items-center gap-2" type="button" onClick={() => handleDelete(event._id)} disabled={busyId === event._id}>
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="d-flex flex-wrap gap-3">
                          <div className="d-flex align-items-center gap-2 text-muted small">
                            <ImageIcon size={14} />
                            <span>{event.imageUrl ? "Custom banner attached" : "No banner image"}</span>
                          </div>
                          <div className="d-flex align-items-center gap-2 text-muted small">
                            <ExternalLink size={14} />
                            <span>{event.format || "Online"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEvents;
