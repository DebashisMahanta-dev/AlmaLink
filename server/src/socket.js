import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let ioInstance = null;

const toUserRoom = (userId) => `user:${userId.toString()}`;

export const initSocketServer = ({ httpServer, allowedOrigins = [] }) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    }
  });

  ioInstance.use((socket, next) => {
    try {
      const authToken = socket.handshake?.auth?.token;
      const headerToken = (socket.handshake?.headers?.authorization || "").replace("Bearer ", "");
      const token = authToken || headerToken;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.userId = payload.sub;
      return next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });

  ioInstance.on("connection", (socket) => {
    const userId = socket.data.userId;
    socket.join(toUserRoom(userId));

    socket.emit("socket:ready", { userId });
  });

  return ioInstance;
};

export const getIO = () => ioInstance;

export const emitToUser = (userId, eventName, payload) => {
  if (!ioInstance) {
    return;
  }
  ioInstance.to(toUserRoom(userId)).emit(eventName, payload);
};