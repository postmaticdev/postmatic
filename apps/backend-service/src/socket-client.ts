/**
 * /src/socket-client.ts
 *
 * Debug Socket.IO client untuk memantau event dari server kamu.
 *
 * Install:
 *   pnpm add socket.io-client
 *   # opsional: pnpm add -D ts-node typescript @types/node
 *   # opsional: pnpm add dotenv
 *
 * Jalanin:
 *   # dengan ts-node
 *   SOCKET_URL=http://localhost:3000 RB=<rootBusinessId> ts-node src/socket-client.ts
 *
 *   # atau dengan argumen:
 *   ts-node src/socket-client.ts --url http://localhost:3000 --rb <rootBusinessId>
 *
 * Env/Args yang didukung:
 *   SOCKET_URL / --url        -> base url server (contoh: http://localhost:3000)
 *   RB / --rb                 -> rootBusinessId untuk join room "rb:<RB>"
 *   SOCKET_TOKEN / --token    -> (opsional) token auth (akan dikirim via 'auth.token')
 *   SOCKET_NS / --ns          -> (opsional) namespace (default "/")
 *   SOCKET_PATH / --path      -> (opsional) custom path Socket.IO (default "/socket.io")
 *   SOCKET_TRANSPORTS         -> (opsional) daftar transports, default "websocket"
 *
 * Commands interaktif (ketik di terminal setelah connect):
 *   join <rootBusinessId>     -> join ke room bisnis (emit "join:business")
 *   leave <rootBusinessId>    -> leave room bisnis
 *   emit <event> <json?>      -> emit event custom ke server, payload JSON opsional
 *   ping                      -> kirim ping (emit "ping")
 *   help                      -> tampilkan bantuan
 *   exit / quit               -> keluar
 */

import { io, Socket } from "socket.io-client";
import "dotenv/config"; // uncomment jika pakai dotenv

type ImageGenJobStatus = "queued" | "processing" | "done" | "error";
type ImageGenJobType = "genBasedOnKnowledge" | "genBasedOnRss" | "regenerate";

interface ImageGenJob<Result = any> {
  id: string;
  type: ImageGenJobType;
  rootBusinessId: string;
  status: ImageGenJobStatus;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  result?: Result;
  error?: { message: string; stack?: string } | null;
  input?: any;
}

function getArg(name: string, def?: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i >= 0 && i + 1 < process.argv.length) return process.argv[i + 1];
  return def;
}
import { BACKEND_URL } from "./constant";

const SERVER_URL = process.env.SOCKET_URL ?? getArg("--url", BACKEND_URL)!;
const RB = process.env.RB ?? getArg("--rb"); // rootBusinessId
const TOKEN = process.env.SOCKET_TOKEN ?? getArg("--token");
const NS = process.env.SOCKET_NS ?? getArg("--ns", "/")!;
const PATH = process.env.SOCKET_PATH ?? getArg("--path", "/socket.io")!;
const TRANSPORTS = (process.env.SOCKET_TRANSPORTS ?? "websocket")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (!SERVER_URL) {
  console.error("❌ SOCKET_URL / --url wajib diisi");
  process.exit(1);
}

function t() {
  return new Date().toISOString().replace("T", " ").replace("Z", "");
}

function log(...args: any[]) {
  console.log(`[${t()}]`, ...args);
}

function pretty(obj: any) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

log("🔌 Debug Socket.IO Client");
log("  URL       :", SERVER_URL);
log("  NS        :", NS);
log("  PATH      :", PATH);
log("  TRANSPORTS:", TRANSPORTS.join(", "));
if (RB) log("  RB        :", RB);
if (TOKEN) log("  TOKEN     :", TOKEN.slice(0, 6) + "...");

const socket: Socket = io(`${SERVER_URL}${NS}`, {
  path: PATH,
  transports: TRANSPORTS as any,
  forceNew: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  auth: TOKEN ? { token: TOKEN } : undefined,
});

// Core events
socket.on("connect", () => {
  log("✅ connected:", socket.id);
  if (RB) {
    socket.emit("join:business", RB);
    log(`↪️  joined room rb:${RB}`);
  }
});

socket.on("disconnect", (reason) => {
  log("❎ disconnected:", reason);
});

socket.on("connect_error", (err) => {
  log("⚠️ connect_error:", err.message);
});

socket.on("reconnect_attempt", (n) => log("… reconnect_attempt", n));
socket.on("reconnect", (n) => log("🔁 reconnected", n));
socket.on("reconnect_failed", () => log("💥 reconnect_failed"));

/** App-specific: dengarkan update dari image generation */
socket.on("imagegen:update", (job: ImageGenJob) => {
  const tag =
    job.status === "done"
      ? "✅"
      : job.status === "error"
      ? "💥"
      : job.status === "processing"
      ? "⏳"
      : "📥";
  log(
    `${tag} imagegen:update`,
    `id=${job.id}`,
    `status=${job.status}`,
    `progress=${job.progress ?? "-"}`
  );
  if (job.status === "error") {
    log("   error:", job.error?.message);
  }
  // tampilkan detail ringkas
  log(
    "   job:",
    pretty({
      id: job.id,
      type: job.type,
      updatedAt: job.updatedAt,
      result: job.result ? "[present]" : undefined,
    })
  );
});

/** Tangkap SEMUA event lain untuk debugging */
socket.onAny((event, ...args) => {
  if (event === "imagegen:update") return; // sudah ditangani khusus
  log("📨 onAny:", event, args.map(pretty).join(" "));
});

// Simple REPL untuk kirim command
import readline from "node:readline";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

printHelp();
prompt();

rl.on("line", async (line) => {
  const [cmd, ...rest] = line.trim().split(" ");
  try {
    switch (cmd) {
      case "join": {
        const id = rest[0] ?? RB;
        if (!id) return log("usage: join <rootBusinessId>");
        socket.emit("join:business", id);
        log(`↪️  joined room rb:${id}`);
        break;
      }
      case "leave": {
        const id = rest[0] ?? RB;
        if (!id) return log("usage: leave <rootBusinessId>");
        socket.emit("leave:business", id);
        log(`↩️  left room rb:${id}`);
        break;
      }
      case "emit": {
        const event = rest[0];
        if (!event) {
          log("usage: emit <event> <json?>");
          break;
        }
        const payloadStr = rest.slice(1).join(" ");
        let payload: any = undefined;
        if (payloadStr) {
          try {
            payload = JSON.parse(payloadStr);
          } catch {
            payload = payloadStr;
          }
        }
        socket.emit(event, payload, (ack?: any) => {
          log("   (ack):", pretty(ack));
        });
        log(
          "➡️  emit:",
          event,
          payload !== undefined ? pretty(payload) : "(no payload)"
        );
        break;
      }
      case "ping": {
        socket.emit("ping", { at: Date.now() }, (ack?: any) =>
          log("   (ack):", pretty(ack))
        );
        log("🏓 ping sent");
        break;
      }
      case "help":
        printHelp();
        break;
      case "exit":
      case "quit":
        cleanupAndExit();
        return;
      default:
        if (cmd) log("unknown command:", cmd);
        printHelp();
    }
  } catch (e: any) {
    log("command error:", e?.message || e);
  } finally {
    prompt();
  }
});

rl.on("SIGINT", cleanupAndExit);

function prompt() {
  rl.setPrompt("> ");
  rl.prompt();
}

function printHelp() {
  log("Commands:");
  console.log("  join <rootBusinessId>     - join room bisnis (rb:<id>)");
  console.log("  leave <rootBusinessId>    - leave room bisnis");
  console.log("  emit <event> <json?>      - emit event custom ke server");
  console.log("  ping                      - kirim ping");
  console.log("  help                      - tampilkan bantuan");
  console.log("  exit | quit               - keluar");
}

function cleanupAndExit() {
  log("bye");
  rl.close();
  socket.disconnect();
  process.exit(0);
}
