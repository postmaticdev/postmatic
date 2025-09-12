import type { Express, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import crypto from "crypto";
import {
  IS_PRODUCTION,
  BACKEND_ORIGIN,
  DASHBOARD_ORIGIN,
  LANDINGPAGE_ORIGIN,
} from "../constant";

// Buat nonce per-request untuk mengizinkan inline <script> spesifik tanpa 'unsafe-inline'
function cspNonce(req: Request, res: Response, next: NextFunction) {
  res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
  next();
}

export function useHelmet(app: Express) {
  // Nonce harus dipasang sebelum helmet()
  app.use(cspNonce);

  app.use(
    helmet({
      // HSTS hanya saat production + HTTPS sudah benar
      hsts: IS_PRODUCTION
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,

      // Jangan aktifkan COEP; bisa mematahkan pihak ketiga
      crossOriginEmbedderPolicy: false,

      // Supaya flow OAuth/popups (kalau perlu) tidak terganggu
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },

      crossOriginResourcePolicy: { policy: "same-origin" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      frameguard: { action: "deny" }, // cegah clickjacking (X-Frame-Options)

      // Content Security Policy (CSP)
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "base-uri": ["'self'"],
          "form-action": [
            "'self'",
            BACKEND_ORIGIN,
            DASHBOARD_ORIGIN,
            LANDINGPAGE_ORIGIN,
          ], // submit form ke origin sendiri
          "object-src": ["'none'"],
          "img-src": ["'self'", "data:"],
          "font-src": ["'self'", "data:"],
          // Inline <style> di EJS → butuh 'unsafe-inline' (boleh; CSS inline tidak memicu XSS)
          "style-src": ["'self'", "'unsafe-inline'"],
          // Izinkan inline <script> HANYA yang ber-nonce + beberapa CDN yang kamu pakai
          "script-src": [
            "'self'",
            // nonce untuk semua <script nonce="..."> di EJS
            (req, res) => `'nonce-${(res as any).locals.cspNonce}'`,
            // Cloudflare Turnstile
            "https://challenges.cloudflare.com",
            // Tailwind CDN
            "https://cdn.tailwindcss.com",
            // Zod UMD (kamu pakai jsDelivr)
            "https://cdn.jsdelivr.net",
            "https://cdn.jsdelivr.net/npm/zod@3.23.8/lib/index.umd.min.js",
            "https://unpkg.com/zod@3.23.8/lib/index.umd.min.js",
          ],
          // Socket.io / fetch ke origin sendiri
          "connect-src": ["'self'", "https:", "wss:"],
          // Turnstile render via iframe
          "frame-src": ["'self'", "https://challenges.cloudflare.com"],
          // Tambahan modern pengganti X-Frame-Options (redundan tapi oke)
          "frame-ancestors": ["'none'"],
          // Optional: upgrade-insecure-requests kalau semua asset sudah https
          "upgrade-insecure-requests": [],
          "navigate-to": [
            "'self'",
            // DASHBOARD_ORIGIN,
            // BACKEND_ORIGIN,
            // LANDINGPAGE_ORIGIN,
          ],
        },
      },
    })
  );

  // Permissions-Policy (tidak tersedia langsung di helmet)
  app.use((req, res, next) => {
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=(), payment=(), browsing-topics=()"
    );
    next();
  });
}
