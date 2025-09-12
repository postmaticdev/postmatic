// backup.ts
import "dotenv/config";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as net from "net";

type TunnelProc = { proc: import("child_process").ChildProcess | null };

// >>> NEW: direktori script (sejajar backup.ts), aman untuk CJS/ESM
const SCRIPT_DIR = __dirname;

function parseUrl(u: string) {
  const x = new URL(u);
  const host = x.hostname || "localhost";
  const port = x.port || "5432";
  const db = decodeURIComponent(x.pathname.replace(/^\//, ""));
  const user = decodeURIComponent(x.username || "");
  const pass = decodeURIComponent(x.password || "");
  const search = x.search; // keep query params (e.g., ?schema=public&sslmode=require)
  return { host, port, db, user, pass, search };
}

function rebuildUrl(u: string, host: string, port: string) {
  const x = new URL(u);
  x.hostname = host;
  x.port = port;
  return x.toString();
}

function run(cmd: string, args: string[], opts: any = {}) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, opts);
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))
    );
  });
}

async function waitPort(port: number, timeoutMs = 7000) {
  const started = Date.now();
  return new Promise<void>((resolve, reject) => {
    const tryOnce = () => {
      const sock = net.connect(port, "127.0.0.1");
      sock.once("connect", () => {
        sock.end();
        resolve();
      });
      sock.once("error", () => {
        sock.destroy();
        if (Date.now() - started > timeoutMs)
          reject(new Error("Tunnel port not ready"));
        else setTimeout(tryOnce, 200);
      });
    };
    tryOnce();
  });
}

function openSshTunnel(cfg: {
  sshHost: string;
  sshUser: string;
  sshPort?: string;
  sshKey?: string;
  localPort: string;
  remoteHost: string;
  remotePort: string;
}): TunnelProc {
  const args = [
    "-L",
    `${cfg.localPort}:${cfg.remoteHost}:${cfg.remotePort}`,
    "-N", // no remote command
    "-o",
    "StrictHostKeyChecking=no",
  ];
  if (cfg.sshPort) {
    args.unshift("-p", cfg.sshPort);
  }
  if (cfg.sshKey) {
    args.unshift("-i", cfg.sshKey);
  }
  args.push(`${cfg.sshUser}@${cfg.sshHost}`);

  const proc = spawn("ssh", args, { stdio: "ignore" });
  return { proc };
}

function closeSshTunnel(t: TunnelProc) {
  try {
    t.proc?.kill();
  } catch {}
}

async function backupDirect(dbUrl: string, outFile: string) {
  const bin = process.env.PG_DUMP_PATH || "pg_dump";
  const args = [
    "--format=plain",
    "--clean",
    "--if-exists",
    "--no-owner",
    "--no-privileges",
    "-f",
    outFile,
    dbUrl,
  ];
  await run(bin, args, { stdio: "inherit" });
}

async function backupViaTunnel(dbUrl: string, outFile: string) {
  const { host, port } = parseUrl(dbUrl);
  const localPort = process.env.SSH_LOCAL_PORT || "55432";
  const sshHost = process.env.SSH_HOST!;
  const sshUser = process.env.SSH_USER!;
  const sshPort = process.env.SSH_PORT || undefined;
  const sshKey = process.env.SSH_KEY_PATH || undefined;
  const remoteHost = process.env.REMOTE_DB_HOST || host || "127.0.0.1";
  const remotePort = process.env.REMOTE_DB_PORT || port || "5432";

  const tunnel = openSshTunnel({
    sshHost,
    sshUser,
    sshPort,
    sshKey,
    localPort,
    remoteHost,
    remotePort,
  });
  try {
    await waitPort(Number(localPort));
    const tunneledUrl = rebuildUrl(dbUrl, "127.0.0.1", localPort);
    await backupDirect(tunneledUrl, outFile);
  } finally {
    closeSshTunnel(tunnel);
  }
}

async function backupRemoteDocker(dbUrl: string, outFile: string) {
  // Jalankan pg_dump DI VPS (mis. jika DB hanya listen 127.0.0.1 atau hanya lewat docker network)
  const { db, user, pass } = parseUrl(dbUrl);
  const sshHost = process.env.SSH_HOST!;
  const sshUser = process.env.SSH_USER!;
  const sshPort = process.env.SSH_PORT || undefined;
  const sshKey = process.env.SSH_KEY_PATH || undefined;
  const container = process.env.REMOTE_POSTGRES_CONTAINER!;

  const remoteHost = process.env.REMOTE_DB_HOST || "127.0.0.1";
  const remotePort = process.env.REMOTE_DB_PORT || "5432";

  const sshArgs = [
    ...(sshPort ? ["-p", sshPort] : []),
    ...(sshKey ? ["-i", sshKey] : []),
    "-o",
    "StrictHostKeyChecking=no",
    `${sshUser}@${sshHost}`,
    // perintah di remote:
    `docker exec -e PGPASSWORD='${pass.replace(
      /'/g,
      `'\\''`
    )}' -i ${container} pg_dump -h ${remoteHost} -p ${remotePort} -U ${user} --format=plain --clean --if-exists --no-owner --no-privileges ${db}`,
  ];

  await new Promise<void>((resolve, reject) => {
    const child = spawn("ssh", sshArgs, {
      stdio: ["ignore", "pipe", "inherit"],
    });
    const ws = fs.createWriteStream(outFile);
    child.stdout.pipe(ws);
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`ssh/pg_dump exited ${code}`))
    );
  });
}

function pickMode(): "remote-docker" | "tunnel" | "direct" {
  if (process.env.REMOTE_POSTGRES_CONTAINER) return "remote-docker";
  if (process.env.SSH_HOST && process.env.SSH_USER) return "tunnel";
  return "direct";
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("ERROR: DATABASE_URL tidak ditemukan di .env");
    process.exit(1);
  }

  // >>> CHANGED: simpan file sejajar backup.ts
  const outFile = path.join(
    SCRIPT_DIR,
    process.env.BACKUP_FILE || "data-backup.sql"
  );

  const mode = pickMode();
  console.log(`> Mode backup: ${mode}`);
  if (mode === "remote-docker") await backupRemoteDocker(dbUrl, outFile);
  else if (mode === "tunnel") await backupViaTunnel(dbUrl, outFile);
  else await backupDirect(dbUrl, outFile);

  console.log(`✅ Backup selesai: ${outFile}`);
}

main().catch((err) => {
  console.error("Backup gagal:", err);
  process.exit(1);
});
