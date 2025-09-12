// src/socket.ts
import { Server } from "socket.io";
import http from "http";

let _io: Server | null = null;

export function initSocket(server: http.Server) {
  _io = new Server(server, {
    cors: { origin: "*" }, // sesuaikan
  });

  _io.on("connection", (socket) => {
    // Client akan emit "join:business" dengan rootBusinessId
    socket.on("join:business", (rootBusinessId: string) => {
      socket.join(`rb:${rootBusinessId}`);
    });

    socket.on("leave:business", (rootBusinessId: string) => {
      socket.leave(`rb:${rootBusinessId}`);
    });
  });

  return _io;
}

export function io() {
  if (!_io) throw new Error("Socket.IO not initialized");
  return _io;
}
