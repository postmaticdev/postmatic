import dotenv from "dotenv";
dotenv.config();

export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
export const DASHBOARD_URL =
  process.env.DASHBOARD_URL || "http://localhost:4000";
export const LANDINGPAGE_URL =
  process.env.LANDINGPAGE_URL || "http://localhost:3000";
export const BACKEND_PORT = process.env.BACKEND_PORT || 5000;
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const APP_NAME = process.env.APP_NAME || "Postmatic API";
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "";
export const LOGO = process.env.LOGO || "https://postmatic.com/logo.png";
export const ADDRESS = process.env.ADDRESS || "Sleman, Yogyakarta, Indonesia";


export  const DASHBOARD_ORIGIN = new URL(DASHBOARD_URL).origin;
export const BACKEND_ORIGIN = new URL(BACKEND_URL).origin;
export const LANDINGPAGE_ORIGIN = new URL(LANDINGPAGE_URL).origin;