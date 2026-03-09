import React, { useState } from "react";
import { ThumbsUp, MessageCircle, Repeat2, Send, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import EditPostModal from "./EditPostModal";

const PostCard = ({ post, currentUser, onLike, onComment, onDelete, onEdit }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const isLiked = post.likes?.some(like => {
    if (typeof like === 'string') {
      return like === currentUser?._id;
    }
    return like?._id === currentUser?._id || like?.toString() === currentUser?._id;
  });

  const handleLike = () => {
    onLike(post._id);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText("");
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      onDelete(post._id);
    }
  };

  const handleEditClick = () => {
    setShowEditModal(true);
    setShowMenu(false);
  };

  const handleEditSave = async (content) => {
    setEditLoading(true);
    try {
      await onEdit(post._id, content);
      setShowEditModal(false);
    } finally {
      setEditLoading(false);
    }
  };

  const isAuthor = post.author?._id === currentUser?._id;

  const getProfilePhoto = (user) => {
    if (!user || !user.email) return "https://i.pravatar.cc/48";
    return `https://i.pravatar.cc/48?u=${user.email}`;
  };

  const getUserInfo = (user) => {
    if (!user) return { name: "Unknown User", title: "" };
    
    const name = user.name || "User";
    let title = "";
    
    if (user.alumniProfile?.position) {
      title = user.alumniProfile.position;
      if (user.alumniProfile.company) {
        title += ` @ ${user.alumniProfile.company}`;
      }
    } else if (user.studentProfile?.major) {
      title = user.studentProfile.major;
    }
    
    return { name, title };
  };

  const authorInfo = getUserInfo(post?.author);
  const timeAgo = post?.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : "just now";

  return (
    <>
      <div className="bg-white rounded shadow-sm mb-2 p-3" style={{ border: "1px solid #e0dfdc" }}>
        {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="d-flex">
          <img 
            src={getProfilePhoto(post.author)}
            alt={authorInfo.name}
            className="rounded-circle me-2"
            style={{ width: "48px", height: "48px", objectFit: "cover" }}
          />
          <div>
            <h6 className="fw-bold mb-0">{authorInfo.name}</h6>
            {authorInfo.title && <small className="text-muted">{authorInfo.title}</small>}
            <div className="text-muted small">{timeAgo}</div>
          </div>
        </div>
        
        {isAuthor && (
          <div style={{ position: "relative" }}>
            <button 
              className="btn btn-link text-muted p-0"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div 
                className="dropdown-menu show" 
                style={{ 
                  position: "absolute", 
                  right: 0, 
                  minWidth: "150px",
                  backgroundColor: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
              >
                <button 
                  className="dropdown-item" 
                  onClick={handleEditClick}
                  style={{ color: "#0077b5", fontSize: "14px", padding: "8px 16px", border: "none", background: "none", width: "100%", textAlign: "left", cursor: "pointer" }}
                >
                  <Edit2 size={16} className="me-2" style={{ display: "inline" }} />
                  Edit post
                </button>
                <button 
                  className="dropdown-item text-danger" 
                  onClick={handleDelete}
                  style={{ fontSize: "14px", padding: "8px 16px", border: "none", background: "none", width: "100%", textAlign: "left", cursor: "pointer" }}
                >
                  <Trash2 size={16} className="me-2" style={{ display: "inline" }} />
                  Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="mb-2" style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
        
        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mt-2">
            {post.images.map((img, idx) => (
              <img 
                key={idx}
                src={img}
                alt="Post content"
                className="img-fluid rounded mb-2"
                style={{ maxHeight: "400px", width: "100%" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Engagement Stats */}
      {(post.likes?.length > 0 || post.comments?.length > 0) && (
        <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom small text-muted">
          <span>
            {post.likes?.length > 0 && `${post.likes.length} ${post.likes.length === 1 ? 'like' : 'likes'}`}
          </span>
          <span>
            {post.comments?.length > 0 && `${post.comments.length} ${post.comments.length === 1 ? 'comment' : 'comments'}`}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="d-flex justify-content-around pt-2 border-top">
        <button 
          className={`btn btn-link text-decoration-none ${isLiked ? 'text-primary' : 'text-muted'}`}
          onClick={handleLike}
        >
          <ThumbsUp size={18} className="me-1" fill={isLiked ? "currentColor" : "none"} />
          Like
        </button>
        <button 
          className="btn btn-link text-muted text-decoration-none"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={18} className="me-1" />
          Comment
        </button>
        <button className="btn btn-link text-muted text-decoration-none">
          <Repeat2 size={18} className="me-1" />
          Repost
        </button>
        <button className="btn btn-link text-muted text-decoration-none">
          <Send size={18} className="me-1" />
          Send
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-top">
          {/* Existing Comments */}
          {post.comments && post.comments.length > 0 && (
            <div className="mb-3">
              {post.comments.map((comment, idx) => (
                <div key={idx} className="d-flex mb-3">
                  <img 
                    src={getProfilePhoto(comment.user)}
                    alt={comment.user?.name}
                    className="rounded-circle me-2"
                    style={{ width: "32px", height: "32px" }}
                  />
                  <div className="flex-grow-1">
                    <div className="bg-light rounded p-2">
                      <div className="fw-semibold small">{comment.user?.name || "User"}</div>
                      <div className="small">{comment.text}</div>
                    </div>
                    <small className="text-muted">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="d-flex">
            <img 
              src={getProfilePhoto(currentUser)}
              alt="Your profile"
              className="rounded-circle me-2"
              style={{ width: "32px", height: "32px" }}
            />
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </form>
        </div>
      )}
      </div>

      <EditPostModal
        show={showEditModal}
        post={post}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditSave}
        loading={editLoading}
      />
    </>
  );
};

export default PostCard;
