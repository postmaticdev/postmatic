import "dotenv/config";

export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";
export const SMTP_HOST = process.env.SMTP_HOST || ""; // e.g. mx3.mailspace.id

// Default to 587 (submission) unless explicitly set
export const SMTP_PORT = Number(process.env.SMTP_PORT || 587);

// If explicitly provided, parse it; otherwise we’ll infer in the transporter by port
export const SMTP_SECURE = (() => {
  if (typeof process.env.SMTP_SECURE === "undefined") return SMTP_PORT === 465;
  return process.env.SMTP_SECURE === "true";
})();

export const SMTP_SERVICE = process.env.SMTP_SERVICE || ""; // not used when host provided
export const SMTP_NAME = process.env.SMTP_NAME || "postmatic.id"; // EHLO/Message-ID domain
export const SMTP_SERVER_NAME = process.env.SMTP_SERVER_NAME || SMTP_HOST; // SNI (usually same as host)
export const SMTP_FROM = process.env.SMTP_FROM || ""; // Reply-To address
