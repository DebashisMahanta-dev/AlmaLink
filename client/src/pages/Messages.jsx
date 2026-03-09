import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Search, Send, Trash2, Phone, Video } from "lucide-react";

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadConversation(selectedUser._id);
    }
  }, [selectedUser]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/messages");
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (userId) => {
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Failed to load conversation", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) {
      return;
    }

    try {
      const res = await api.post("/messages", {
        recipient: selectedUser._id,
        content: messageText,
      });

      setMessages([...messages, res.data.message]);
      setMessageText("");
      loadConversations(); // Refresh conversations to update last message
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Failed to send message");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      await api.delete(`/messages/${messageId}`);
      setMessages(messages.filter((m) => m._id !== messageId));
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv._id.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv._id.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConversationTitle = (conv) => {
    return conv._id?.name || "Unknown User";
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 56px)", backgroundColor: "#f8f9fa" }}>
      {/* Conversations Sidebar */}
      <div
        style={{
          width: "350px",
          backgroundColor: "#fff",
          borderRight: "1px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px", borderBottom: "1px solid #e0e0e0" }}>
          <h5 className="fw-bold mb-3">Messages</h5>
          <div style={{ position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#999",
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "40px" }}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div className="p-3 text-center text-muted">Loading...</div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <div
                key={conv._id._id}
                onClick={() => setSelectedUser(conv._id)}
                style={{
                  padding: "15px",
                  borderBottom: "1px solid #f0f0f0",
                  cursor: "pointer",
                  backgroundColor:
                    selectedUser?._id === conv._id._id ? "#f0f4f8" : "transparent",
                  transition: "background-color 0.2s",
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={`https://i.pravatar.cc/48?u=${conv._id.email}`}
                    alt={conv._id.name}
                    className="rounded-circle"
                    style={{ width: "48px", height: "48px" }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="fw-semibold text-truncate">
                      {getConversationTitle(conv)}
                    </div>
                    <small className="text-muted text-truncate d-block">
                      {conv.lastMessage}
                    </small>
                    <small className="text-muted">
                      {formatDate(conv.lastMessageTime)}
                    </small>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span
                      className="badge bg-primary rounded-pill"
                      style={{ minWidth: "20px", textAlign: "center" }}
                    >
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-muted">
              {searchTerm ? "No conversations found" : "No messages yet"}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
        }}
      >
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <img
                  src={`https://i.pravatar.cc/48?u=${selectedUser.email}`}
                  alt={selectedUser.name}
                  className="rounded-circle"
                  style={{ width: "48px", height: "48px" }}
                />
                <div>
                  <div className="fw-semibold">{selectedUser.name}</div>
                  <small className="text-muted">
                    {selectedUser.alumniProfile?.position ||
                      selectedUser.studentProfile?.major ||
                      "Member"}
                  </small>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-secondary rounded-circle">
                  <Phone size={18} />
                </button>
                <button className="btn btn-sm btn-outline-secondary rounded-circle">
                  <Video size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    style={{
                      display: "flex",
                      justifyContent:
                        msg.sender._id === user._id
                          ? "flex-end"
                          : "flex-start",
                      alignItems: "flex-end",
                      gap: "8px",
                    }}
                  >
                    {msg.sender._id !== user._id && (
                      <img
                        src={`https://i.pravatar.cc/32?u=${msg.sender.email}`}
                        alt={msg.sender.name}
                        className="rounded-circle"
                        style={{ width: "32px", height: "32px" }}
                      />
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems:
                          msg.sender._id === user._id
                            ? "flex-end"
                            : "flex-start",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "400px",
                          padding: "10px 14px",
                          borderRadius: "12px",
                          backgroundColor:
                            msg.sender._id === user._id
                              ? "#0077b5"
                              : "#f0f0f0",
                          color:
                            msg.sender._id === user._id ? "#fff" : "#333",
                          wordWrap: "break-word",
                        }}
                      >
                        {msg.content}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                          fontSize: "0.75rem",
                          color: "#999",
                        }}
                      >
                        <span>{formatTime(msg.createdAt)}</span>
                        {msg.sender._id === user._id && (
                          <button
                            className="btn btn-sm btn-link p-0 text-danger"
                            onClick={() => handleDeleteMessage(msg._id)}
                            style={{ fontSize: "0.7rem", textDecoration: "none" }}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-5">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div
              style={{
                padding: "20px",
                borderTop: "1px solid #e0e0e0",
                backgroundColor: "#f8f9fa",
              }}
            >
              <form onSubmit={handleSendMessage} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control rounded-pill"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary rounded-circle"
                  disabled={!messageText.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100">
            <div className="text-center text-muted">
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
