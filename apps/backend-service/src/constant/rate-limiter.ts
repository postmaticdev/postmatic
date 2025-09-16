import dotenv from "dotenv";
dotenv.config();

export const RATE_LIMIT_CAPACITY = parseInt(
  process.env.RATE_LIMIT_CAPACITY || "120",
  10
);
export const RATE_LIMIT_REFILL_PER_SEC = parseInt(
  process.env.RATE_LIMIT_REFILL_PER_SEC || "2",
  10
);
export const RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || "60000",
  10
);
