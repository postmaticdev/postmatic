import type { Request, Response, NextFunction } from "express";
import {
  TURNSTILE_ENABLED,
  TURNSTILE_EXPECT_HOST,
  TURNSTILE_SECRET_KEY,
  TURNSTILE_SITE_KEY,
} from "../constant/turnstile";
import axios from "axios";
import { LANDINGPAGE_URL } from "../constant";

// ---- Util verifikasi ke Cloudflare ----
async function verifyToken(token: string, ip: string) {
  const form = new URLSearchParams();
  form.set("secret", TURNSTILE_SECRET_KEY);
  form.set("response", token);
  if (ip) form.set("remoteip", ip);

  const r = await axios.post(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    form
  );
  const data = await r.data;

  const ok =
    !!data?.success &&
    (!TURNSTILE_EXPECT_HOST || data?.hostname === TURNSTILE_EXPECT_HOST);

  return {
    ok,
    data,
    reason: ok
      ? undefined
      : data?.["error-codes"]?.[0] || "verification_failed",
  };
}

// ---- Expose ke view (EJS) ----
function expose(req: Request, res: Response, next: NextFunction) {
  const enabled =
    TURNSTILE_ENABLED && !!TURNSTILE_SITE_KEY && !!TURNSTILE_SECRET_KEY;
  res.locals.TURNSTILE_ENABLED = enabled;
  res.locals.TURNSTILE_SITE_KEY = TURNSTILE_SITE_KEY;
  next();
}

// ---- STRICT verify: gagal -> hentikan; sukses -> next() ----
async function verify(req: Request, res: Response, next: NextFunction) {
  if (!TURNSTILE_ENABLED) {
    return next();
  }

  // Token Turnstile default disubmit di field ini:
  const token = (req.body?.["cf-turnstile-response"] as string) || "";
  if (!token) {
    // JSON vs Form
    const wantsJSON =
      req.headers["content-type"]?.includes("application/json") ||
      req.xhr ||
      req.get("Accept")?.includes("application/json") ||
      req.query.type === "json";
    if (wantsJSON) {
      return res.status(400).json({
        metaData: { code: 400, message: "Bad Request" },
        responseMessage: "Captcha gagal diverifikasi",
      });
    }
    // Form EJS: biarkan controller re-render dengan error standar
    req.turnstile = {
      ok: false,
      code: "missing_token",
      message: "Captcha gagal diverifikasi",
    };
    return res.status(400).render("error", {
      code: 400,
      title: "Captcha diperlukan",
      description: "Captcha gagal diverifikasi. Silakan kembali dan coba lagi.",
      ctaText: "Kembali",
      ctaHref: req.get("referer") || "/api/auth/page/login",
      LANDINGPAGE_URL,
      metaData: { code: 400, message: "Bad Request" },
    });
  }

  const ip = req.ip || "";
  try {
    const result = await verifyToken(token, ip);
    if (!result.ok) {
      const wantsJSON =
        req.headers["content-type"]?.includes("application/json") ||
        req.xhr ||
        req.get("Accept")?.includes("application/json") ||
        req.query.type === "json";

      if (wantsJSON) {
        return res.status(400).json({
          metaData: { code: 400, message: "Bad Request" },
          responseMessage: "Captcha gagal diverifikasi",
          detail: result.data,
        });
      }

      // Untuk form EJS, bisa re-render halaman info atau redirect balik.
      return res.status(400).render("error", {
        code: 400,
        title: "Captcha tidak valid",
        description: "Verifikasi captcha gagal. Silakan ulangi.",
        ctaText: "Kembali",
        ctaHref: req.get("referer") || "/api/auth/page/login",
        LANDINGPAGE_URL,
        metaData: { code: 400, message: "Bad Request" },
      });
    }

    // sukses
    req.turnstile = { ok: true, raw: result.data };
    next();
  } catch (e) {
    return res.render("error", {
      code: 500,
      title: "Terjadi kesalahan",
      description: "Terjadi kesalahan saat memverifikasi captcha",
      ctaText: "Kembali",
      ctaHref: req.get("referer") || "/api/auth/page/login",
      LANDINGPAGE_URL,
      metaData: { code: 500, message: "Internal Server Error" },
    });
  }
}

// ---- SOFT verify: tidak menghentikan alur; controller yang memutuskan ----
async function softVerify(req: Request, res: Response, next: NextFunction) {
  const enabled =
    TURNSTILE_ENABLED && !!TURNSTILE_SITE_KEY && !!TURNSTILE_SECRET_KEY;

  if (!enabled) {
    req.turnstile = { ok: true };
    return next();
  }

  const token = (req.body?.["cf-turnstile-response"] as string) || "";
  if (!token) {
    req.turnstile = {
      ok: false,
      code: "missing_token",
      message: "Captcha gagal diverifikasi",
    };
    return next();
  }

  const ip = req.ip || "";
  try {
    const result = await verifyToken(token, ip);
    req.turnstile = result.ok
      ? { ok: true, raw: result.data }
      : {
          ok: false,
          code: result.reason,
          message: "Captcha gagal diverifikasi",
          raw: result.data,
        };
    next();
  } catch {
    req.turnstile = {
      ok: false,
      code: "verify_error",
      message: "Captcha gagal diverifikasi",
    };
    next();
  }
}

export const useTurnstile = {
  expose,
  verify,
  softVerify,
};
