export const TURNSTILE_ENABLED = process.env.TURNSTILE_ENABLED === "true";
export const TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY || "";
export const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "";
export const TURNSTILE_EXPECT_HOST = process.env.TURNSTILE_EXPECT_HOST || ""; // opsional
