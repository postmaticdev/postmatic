"use client";

import { NEXT_PUBLIC_API_ORIGIN } from "@/constants";
import { io, Socket } from "socket.io-client";

type Transport = "websocket" | "polling";

let socket: Socket | null = null;

type CreateSocketOpts = {
  token?: string | null;
  ns?: string;
  path?: string;
  transports?: Transport[];
  url?: string;
};

export function getSocket() {
  return socket;
}

export function createSocket(opts: CreateSocketOpts = {}) {
  if (socket && socket.connected) return socket;

  const url = opts.url ?? NEXT_PUBLIC_API_ORIGIN;

  socket = io(`${url}`, {
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    auth: opts.token ? { token: opts.token } : undefined,
    autoConnect: true,
  });

  return socket;
}

export function destroySocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
