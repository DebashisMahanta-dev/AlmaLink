import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Donations = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [summary, setSummary] = useState({ totalAmount: 0, totalCount: 0 });
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    purpose: "",
    note: ""
  });

  const canPledge = user?.role === "alumni" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, donationsRes] = await Promise.all([
        api.get("/donations/summary"),
        api.get("/donations")
      ]);
      setSummary(summaryRes.data || { totalAmount: 0, totalCount: 0 });
      setDonations(donationsRes.data?.donations || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitPledge = async (e) => {
    e.preventDefault();
    if (!canPledge) return;
    setSaving(true);
    try {
      await api.post("/donations", {
        amount: Number(form.amount),
        purpose: form.purpose.trim(),
        note: form.note.trim()
      });
      toast.success("Donation pledge submitted");
      setForm({ amount: "", purpose: "", note: "" });
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit donation");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/donations/${id}/status`, { status });
      toast.success("Donation status updated");
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-3">Alumni Donations</h1>
      <p className="text-muted">Support scholarships, events, and campus initiatives.</p>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="mb-1">Total Pledged</h5>
              <div className="fs-3 fw-bold">₹{Number(summary.totalAmount || 0).toLocaleString("en-IN")}</div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="mb-1">Total Contributions</h5>
              <div className="fs-3 fw-bold">{Number(summary.totalCount || 0)}</div>
            </div>
          </div>
        </div>
      </div>

      {canPledge && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="mb-3">Make a Pledge</h5>
            <form onSubmit={submitPledge}>
              <div className="row g-3">
                <div className="col-md-3">
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="Amount (INR)"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Purpose (e.g., Scholarship)"
                    value={form.purpose}
                    onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Optional note"
                    value={form.note}
                    onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                  />
                </div>
              </div>
              <button className="btn btn-primary mt-3" type="submit" disabled={saving}>
                {saving ? "Submitting..." : "Submit Pledge"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Recent Donations</h5>
          {loading ? (
            <p className="text-muted mb-0">Loading...</p>
          ) : donations.length === 0 ? (
            <p className="text-muted mb-0">No donations yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Purpose</th>
                    <th>Amount</th>
                    <th>Status</th>
                    {isAdmin && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {donations.map((item) => (
                    <tr key={item._id}>
                      <td>{item.donor?.name || "Unknown"}</td>
                      <td>{item.purpose}</td>
                      <td>₹{Number(item.amount || 0).toLocaleString("en-IN")}</td>
                      <td>{item.status}</td>
                      {isAdmin && (
                        <td>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => updateStatus(item._id, item.status === "received" ? "pledged" : "received")}
                          >
                            Mark {item.status === "received" ? "Pledged" : "Received"}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Donations;
