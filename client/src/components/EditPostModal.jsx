import React, { useState } from "react";
import { X } from "lucide-react";

const EditPostModal = ({ show, post, onClose, onSave, loading }) => {
  const [content, setContent] = useState(post?.content || "");
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!content.trim()) {
      setError("Post content cannot be empty");
      return;
    }

    setError("");
    await onSave(content.trim());
    setContent(post?.content || "");
  };

  const handleClose = () => {
    setContent(post?.content || "");
    setError("");
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal d-block"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1050,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={handleClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">Edit Post</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
            />
          </div>

          <div className="modal-body">
            {error && (
              <div className="alert alert-danger mb-3 small">{error}</div>
            )}

            <textarea
              className="form-control"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              disabled={loading}
              style={{ resize: "none" }}
            />
            <small className="text-muted mt-2 d-block">
              {content.length} characters
            </small>
          </div>

          <div className="modal-footer border-top">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading || !content.trim()}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
