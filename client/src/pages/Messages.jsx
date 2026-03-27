import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Search, Send, Trash2, Phone, Video, Users } from "lucide-react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";

const POLL_INTERVAL_MS = 20000;
const SOCKET_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const socketRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadConversations();
    loadConnections();
  }, []);

  useEffect(() => {
    if (selectedConversation?.conversationId) {
      loadConversationMessages(selectedConversation.conversationId);
    }
  }, [selectedConversation?.conversationId]);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    const selectedUserId = location.state?.selectedUserId;
    if (!selectedUserId) {
      return;
    }

    selectOrCreateDirectConversation(selectedUserId);
  }, [location.state?.selectedUserId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user?._id) {
      return undefined;
    }

    const socket = io(SOCKET_BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"]
    });
    socketRef.current = socket;

    socket.on("message:new", ({ conversationId, message }) => {
      if (!conversationId || !message) {
        return;
      }

      const activeConversationId = selectedConversationRef.current?.conversationId;
      if (activeConversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((existing) => existing._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });
      }

      loadConversations({ silent: true });
    });

    socket.on("conversation:updated", ({ conversation }) => {
      if (!conversation) {
        loadConversations({ silent: true });
        return;
      }

      const normalized = normalizeConversation(conversation);
      setConversations((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.conversationId === normalized.conversationId
        );

        if (existingIndex === -1) {
          return [normalized, ...prev];
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...normalized,
        };

        return updated.sort(
          (a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0)
        );
      });
    });

    socket.on("message:deleted", ({ conversationId, messageId }) => {
      if (!conversationId || !messageId) {
        return;
      }

      if (selectedConversationRef.current?.conversationId === conversationId) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      }

      loadConversations({ silent: true });
    });

    socket.on("messages:read", ({ conversationId, readerId, readAt }) => {
      if (!conversationId || !readerId) {
        return;
      }

      if (selectedConversationRef.current?.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => {
            const senderId = typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
            const recipientId = typeof msg.recipient === "object" ? msg.recipient?._id : msg.recipient;

            if (senderId === user._id && recipientId === readerId) {
              return { ...msg, isRead: true, readAt: readAt || new Date().toISOString() };
            }
            return msg;
          })
        );
      }

      loadConversations({ silent: true });
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connection failed, polling remains active:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (document.visibilityState !== "visible") {
        return;
      }

      // Keep lightweight polling as a resilience fallback when socket transport drops.
      loadConversations({ silent: true });
      if (selectedConversation?.conversationId) {
        loadConversationMessages(selectedConversation.conversationId);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [selectedConversation?.conversationId]);

  const normalizeConversation = (conv) => {
    const conversationId = conv.conversationId || conv._id;
    const otherUser = conv.otherUser || conv._id || null;
    return {
      conversationId,
      otherUser,
      unreadCount: conv.unreadCount || 0,
      lastMessage: conv.lastMessage || "",
      lastMessageTime: conv.lastMessageTime || conv.updatedAt,
    };
  };

  const loadConversations = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const res = await api.get("/messages/conversations");
      const normalized = (res.data.conversations || []).map(normalizeConversation);
      setConversations(normalized);
    } catch (err) {
      try {
        const fallbackRes = await api.get("/messages");
        const normalized = (fallbackRes.data.conversations || []).map(normalizeConversation);
        setConversations(normalized);
      } catch (fallbackErr) {
        console.error("Failed to load conversations", fallbackErr);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const loadConnections = async () => {
    try {
      setConnectionsLoading(true);
      const res = await api.get("/connections");
      const connectedUsers = (res.data.connections || [])
        .map((item) => item.connectedUser)
        .filter(Boolean);
      setConnections(connectedUsers);
    } catch (err) {
      console.error("Failed to load connections", err);
    } finally {
      setConnectionsLoading(false);
    }
  };

  const selectOrCreateDirectConversation = async (userId) => {
    try {
      const res = await api.post(`/messages/conversations/direct/${userId}`);
      const normalized = normalizeConversation(res.data.conversation || {});
      setSelectedConversation(normalized);
      setConversations((prev) => {
        const hasConversation = prev.some((item) => item.conversationId === normalized.conversationId);
        if (hasConversation) {
          return prev;
        }
        return [normalized, ...prev];
      });
    } catch (err) {
      console.error("Failed to open direct conversation", err);
    }
  };

  const loadConversationMessages = async (conversationId) => {
    try {
      const res = await api.get(`/messages/conversations/${conversationId}/messages`);
      setMessages(res.data.messages || []);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversationId === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (err) {
      console.error("Failed to load conversation messages", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedConversation?.conversationId) {
      return;
    }

    try {
      const res = await api.post(`/messages/conversations/${selectedConversation.conversationId}/messages`, {
        content: messageText,
      });

      setMessages((prev) => [...prev, res.data.message]);
      setMessageText("");
      setConversations((prev) =>
        prev
          .map((conv) =>
            conv.conversationId === selectedConversation.conversationId
              ? {
                  ...conv,
                  lastMessage: res.data.message?.content || messageText.trim(),
                  lastMessageTime: res.data.message?.createdAt || new Date().toISOString(),
                  unreadCount: 0,
                }
              : conv
          )
          .sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0))
      );
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Failed to send message");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      await api.delete(`/messages/${messageId}`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.otherUser?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConnections = connections.filter(
    (connectedUser) =>
      connectedUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connectedUser?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConversationTitle = (conv) => {
    return conv.otherUser?.name || "Unknown User";
  };

  const selectedUser = selectedConversation?.otherUser || null;

  const getSenderId = (msg) => (typeof msg.sender === "object" ? msg.sender?._id : msg.sender);

  const isOwnMessage = (msg) => getSenderId(msg) === user._id;

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
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f3f5" }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <small className="text-uppercase text-muted fw-semibold">Connections</small>
              <Users size={14} className="text-muted" />
            </div>
            {connectionsLoading ? (
              <small className="text-muted">Loading connections...</small>
            ) : filteredConnections.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {filteredConnections.map((connectedUser) => (
                  <button
                    key={connectedUser._id}
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => selectOrCreateDirectConversation(connectedUser._id)}
                    title={`Message ${connectedUser.name}`}
                  >
                    {connectedUser.name}
                  </button>
                ))}
              </div>
            ) : (
              <small className="text-muted">No accepted connections yet.</small>
            )}
          </div>

          {loading ? (
            <div className="p-3 text-center text-muted">Loading...</div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <div
                key={conv.conversationId}
                onClick={() => setSelectedConversation(conv)}
                style={{
                  padding: "15px",
                  borderBottom: "1px solid #f0f0f0",
                  cursor: "pointer",
                  backgroundColor:
                    selectedConversation?.conversationId === conv.conversationId ? "#f0f4f8" : "transparent",
                  transition: "background-color 0.2s",
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={`https://i.pravatar.cc/48?u=${conv.otherUser?.email || conv.conversationId}`}
                    alt={conv.otherUser?.name || "User"}
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
                        isOwnMessage(msg)
                          ? "flex-end"
                          : "flex-start",
                      alignItems: "flex-end",
                      gap: "8px",
                    }}
                  >
                    {!isOwnMessage(msg) && (
                      <img
                        src={`https://i.pravatar.cc/32?u=${msg.sender?.email || msg.sender}`}
                        alt={msg.sender?.name || "User"}
                        className="rounded-circle"
                        style={{ width: "32px", height: "32px" }}
                      />
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems:
                          isOwnMessage(msg)
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
                            isOwnMessage(msg)
                              ? "#0077b5"
                              : "#f0f0f0",
                          color:
                            isOwnMessage(msg) ? "#fff" : "#333",
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
                        {isOwnMessage(msg) && (
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
