import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Image as ImageIcon, Plus, Trash2 } from "lucide-react";

const CreatePostModal = ({ show, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImages((prev) => [...prev, event.target.result]);
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please select image files only");
      }
    });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert("Please write something to post");
      return;
    }

    setLoading(true);
    
    try {
      await onPostCreated(content, images);
      setContent("");
      setImages([]);
      onClose();
    } catch (err) {
      console.error("Failed to create post", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div 
      className="modal d-block" 
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div 
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">Create a post</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          
          <div className="modal-body">
            <div className="d-flex align-items-center mb-3">
              <img 
                src={`https://i.pravatar.cc/48?u=${user?.email}`}
                alt={user?.name}
                className="rounded-circle me-2"
                style={{ width: "48px", height: "48px" }}
              />
              <div>
                <div className="fw-semibold">{user?.name}</div>
                <small className="text-muted">
                  {user?.alumniProfile?.position || user?.studentProfile?.major || "Member"}
                </small>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                className="form-control border-0 p-0"
                placeholder="What do you want to talk about?"
                rows="6"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
                style={{ 
                  resize: "none", 
                  fontSize: "1rem",
                  outline: "none",
                  boxShadow: "none"
                }}
                autoFocus
              />

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-3 mb-3">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
                    {images.map((img, idx) => (
                      <div key={idx} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", backgroundColor: "#f0f0f0" }}>
                        <img 
                          src={img} 
                          alt={`Preview ${idx + 1}`}
                          style={{ width: "100%", height: "100px", objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemoveImage(idx)}
                          style={{ position: "absolute", top: "5px", right: "5px", zIndex: 10 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 pt-3 border-top">
                <label className="btn btn-link text-muted text-decoration-none p-0" style={{ cursor: "pointer" }}>
                  <ImageIcon size={20} className="me-2" style={{ display: "inline" }} />
                  Add photo
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: "none" }}
                    disabled={loading}
                  />
                </label>
              </div>

              <div className="mt-3">
                <button
                  type="submit"
                  className="btn btn-primary w-100 rounded-pill"
                  disabled={loading || !content.trim()}
                  style={{ padding: "10px" }}
                >
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
