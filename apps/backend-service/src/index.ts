if (process.env.NODE_ENV !== "production") {
  (async () => {
    await import("dotenv/config");
  })();
}

import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import passport from "passport";
import path from "path";
import useragent from "express-useragent";
import http from "http";
import cookieParser from "cookie-parser";

import {
  APP_NAME,
  BACKEND_URL,
  BACKEND_PORT,
  LANDINGPAGE_URL,
  IS_PRODUCTION,
} from "./constant";
import { SESSION_SECRET } from "./constant/auth";
import router from "./routes/index";
import "./utils/auth";
import { AutoSchedulerTaskManager } from "./cron/AutoSchedulerTaskManager";
import { ManualSchedulerTaskManager } from "./cron/ManualSchedulerTaskManager";
import { initSocket } from "./socket";
import { useRateLimiter } from "./middleware/use-rate-limiter";
import {
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
} from "./constant/rate-limiter";
import { useCsrf } from "./middleware/use-csrf";
import { useHelmet } from "./middleware/use-helmet";

const app = express();
const server = http.createServer(app);
initSocket(server);

// ------- Middleware -------
app.disable("x-powered-by");

app.use(
  cors({
    // TODO: isi origin dengan domain yang valid
    origin: "*",
    credentials: IS_PRODUCTION,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(morgan("dev"));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());
app.use(useragent.express());

app.set("trust proxy", true);

// ------- View & Static -------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari
      secure: process.env.NODE_ENV === "production", // true bila pakai HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/static", express.static(path.join(__dirname, "public")));

app.use(
  useRateLimiter({
    capacity: RATE_LIMIT_MAX_REQUESTS,
    refillPerSec: RATE_LIMIT_MAX_REQUESTS / (RATE_LIMIT_WINDOW_MS / 1000),
    windowMs: RATE_LIMIT_WINDOW_MS,
    key: (req) => req?.ip || "",
  })
);

useHelmet(app);

// ------- Routes -------
app.get("/", (req, res) => res.send("Hello World CI/CD Works!"));
app.get('/__version', (req,res)=>res.json({
  env: process.env.ENV_NAME, sha: process.env.GIT_SHA
}));

app.use("/api", router);

app.use(useCsrf.errorHandler);

// ------- Start server dulu, lalu recovery di background -------
server.listen(BACKEND_PORT, async () => {
  console.log(`HTTP listening on ${BACKEND_PORT}`);
  console.log(
    `${BACKEND_URL}?dateStart=${new Date().toISOString()}&dateEnd=${new Date().toISOString()}`
  );
  console.log(`Socket.IO attached on the same port`);

  // Kick off long-running recoveries tanpa menghambat startup
  (async () => {
    try {
      console.log("Starting AutoSchedulerTaskManager recovery…");
      await AutoSchedulerTaskManager.instance.recoverOnStartup();
      console.log("AutoSchedulerTaskManager initialized.");

      console.log("Starting ManualSchedulerTaskManager recovery…");
      await ManualSchedulerTaskManager.instance.recoverOnStartup();
      console.log("ManualSchedulerTaskManager initialized.");
    } catch (e) {
      console.error("Task manager recovery failed:", e);
    }
  })();
});
