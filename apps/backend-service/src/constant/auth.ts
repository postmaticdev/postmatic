import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "secret";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
export const SESSION_SECRET = process.env.SESSION_SECRET || "session_secret";

export const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || "";
export const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || "";
export const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || "";