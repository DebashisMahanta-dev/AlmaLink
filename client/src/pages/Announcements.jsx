import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

const Announcements = () => {
  const toast = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState({ title: "", content: "" });

  const loadAnnouncements = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/announcements/admin/all");
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load announcements");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const resetForm = () => {
    setForm({ title: "", content: "" });
    setEditingId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/announcements/${editingId}`, {
          title: form.title.trim(),
          content: form.content.trim()
        });
        toast.success("Announcement updated");
      } else {
        await api.post("/announcements", {
          title: form.title.trim(),
          content: form.content.trim()
        });
        toast.success("Announcement created");
      }
      resetForm();
      await loadAnnouncements();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setForm({ title: entry.title || "", content: entry.content || "" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this announcement?");
    if (!confirmed) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Announcement deleted");
      if (editingId === id) {
        resetForm();
      }
      await loadAnnouncements();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete announcement");
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Announcements</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3">{editingId ? "Edit Announcement" : "New Announcement"}</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                maxLength={140}
                placeholder="Enter announcement title"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Content</label>
              <textarea
                className="form-control"
                rows="5"
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Write your announcement..."
              />
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Announcement" : "Create Announcement"}
              </button>
              {editingId && (
                <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">All Announcements</h5>
          {loading ? (
            <p className="text-muted mb-0">Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <p className="text-muted mb-0">No announcements posted yet.</p>
          ) : (
            <div className="list-group">
              {announcements.map((entry) => (
                <div key={entry._id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <h6 className="mb-1">{entry.title}</h6>
                      <p className="mb-2">{entry.content}</p>
                      <small className="text-muted">
                        Posted by {entry.createdBy?.name || "Admin"} on {new Date(entry.createdAt).toLocaleString()}
                      </small>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(entry)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(entry._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
