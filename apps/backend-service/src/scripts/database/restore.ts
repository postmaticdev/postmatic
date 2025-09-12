// restore.ts
import "dotenv/config";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as net from "net";
import * as readline from "readline";

type TunnelProc = { proc: import("child_process").ChildProcess | null };

// Folder yang sama dengan file script (sejajar backup.ts / restore.ts)
const SCRIPT_DIR = __dirname;

function parseUrl(u: string) {
  const x = new URL(u);
  const host = x.hostname || "localhost";
  const port = x.port || "5432";
  const db = decodeURIComponent(x.pathname.replace(/^\//, ""));
  const user = decodeURIComponent(x.username || "");
  const pass = decodeURIComponent(x.password || "");
  return { host, port, db, user, pass };
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
    "-N",
    "-o",
    "StrictHostKeyChecking=no",
  ];
  if (cfg.sshPort) args.unshift("-p", cfg.sshPort);
  if (cfg.sshKey) args.unshift("-i", cfg.sshKey);
  args.push(`${cfg.sshUser}@${cfg.sshHost}`);
  const proc = spawn("ssh", args, { stdio: "ignore" });
  return { proc };
}

function closeSshTunnel(t: TunnelProc) {
  try {
    t.proc?.kill();
  } catch {}
}

async function restoreDirect(dbUrl: string, sqlFile: string) {
  const bin = process.env.PSQL_PATH || "psql";
  const args = [
    "--single-transaction",
    "--set",
    "ON_ERROR_STOP=1",
    "--file",
    sqlFile,
    "--dbname",
    dbUrl,
  ];
  await run(bin, args, { stdio: "inherit" });
}

async function restoreViaTunnel(dbUrl: string, sqlFile: string) {
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
    await restoreDirect(tunneledUrl, sqlFile);
  } finally {
    closeSshTunnel(tunnel);
  }
}

async function restoreRemoteDocker(dbUrl: string, sqlFile: string) {
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
    `docker exec -e PGPASSWORD='${pass.replace(
      /'/g,
      `'\\''`
    )}' -i ${container} psql -h ${remoteHost} -p ${remotePort} -U ${user} -d ${db} -v ON_ERROR_STOP=1 --single-transaction`,
  ];

  await new Promise<void>((resolve, reject) => {
    const child = spawn("ssh", sshArgs, {
      stdio: ["pipe", "inherit", "inherit"],
    });
    const rs = fs.createReadStream(sqlFile);
    rs.pipe(child.stdin!);
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`ssh/psql exited ${code}`))
    );
  });
}

/** Sanitize dump: hapus baris SET yang bikin tidak kompatibel */
async function sanitizeDump(srcFile: string, dstFile: string) {
  const rl = readline.createInterface({
    input: fs.createReadStream(srcFile),
    crlfDelay: Infinity,
  });
  const ws = fs.createWriteStream(dstFile);

  const setGucRe = /^\s*SET\s+([a-zA-Z0-9_."']+)\s*=\s*.*;?\s*$/i;
  const setConfigRe = /set_config\(\s*'([^']+)'\s*,/i;

  const shouldStrip = (param: string) => {
    const p = param.replace(/["']/g, "").toLowerCase();
    // 'transaction_timeout' bukan GUC Postgres standar → buang selalu
    if (p === "transaction_timeout") return true;
    // 'idle_session_timeout' baru ada di PG14 → aman dibuang (opsional)
    if (p === "idle_session_timeout") return true;
    return false;
  };

  for await (const line of rl) {
    let drop = false;

    const m1 = line.match(setGucRe);
    if (m1 && shouldStrip(m1[1])) drop = true;

    const m2 = line.match(setConfigRe);
    if (m2 && shouldStrip(m2[1])) drop = true;

    if (!drop) ws.write(line + "\n");
  }

  await new Promise<void>((res, rej) => {
    ws.on("finish", () => res());
    ws.on("error", rej);
    ws.end();
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

  const srcSql = path.join(
    SCRIPT_DIR,
    process.env.BACKUP_FILE || "data-backup.sql"
  );
  if (!fs.existsSync(srcSql)) {
    console.error(`ERROR: File backup tidak ditemukan: ${srcSql}`);
    process.exit(1);
  }

  // Buat file sementara hasil sanitasi di folder yang sama
  const sanitized = path.join(SCRIPT_DIR, `.sanitized-${Date.now()}.sql`);

  try {
    console.log("> Menyiapkan file restore (sanitizing)...");
    await sanitizeDump(srcSql, sanitized);

    const mode = pickMode();
    console.log(`> Mode restore: ${mode}`);
    if (mode === "remote-docker") await restoreRemoteDocker(dbUrl, sanitized);
    else if (mode === "tunnel") await restoreViaTunnel(dbUrl, sanitized);
    else await restoreDirect(dbUrl, sanitized);

    console.log("✅ Restore selesai.");
  } finally {
    // Hapus file sementara (kecuali kamu ingin menyimpan untuk debug)
    try {
      fs.unlinkSync(sanitized);
    } catch {}
  }
}

main().catch((err) => {
  console.error("Restore gagal:", err);
  process.exit(1);
});
