import { Request, Response, NextFunction } from "express";
import csurf from "csurf";
import { IS_PRODUCTION, LANDINGPAGE_URL } from "../constant";

// Cookie-based double submit token
const protection = csurf({
  cookie: {
    httpOnly: true, // token tidak bisa dibaca JS
    sameSite: "lax", // aman utk form same-site
    secure: IS_PRODUCTION, // true di production (HTTPS)
  },
});

// Hanya inject token ke view pada request safe
function exposeToken(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    const hasFn = typeof req.csrfToken === "function";
    res.locals.csrfToken = hasFn ? req?.csrfToken?.() : ""; // selalu terdefinisi
  }
  res.setHeader("Cache-Control", "no-store");
  next();
}

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err.code !== "EBADCSRFTOKEN") return next(err);

  const wantsJSON =
    req.headers["content-type"]?.includes("application/json") ||
    req.xhr ||
    req.get("Accept")?.includes("application/json");

  if (wantsJSON) {
    return res.status(403).json({
      responseMessage:
        "Invalid or missing CSRF token. Please refresh the page.",
      metaData: {
        code: 403,
        message: "Forbidden",
      },
    });
  }

  const url = req.url;

  return res.status(403).render("error", {
    code: 403,
    title: "Form expired",
    description:
      "Form kedaluwarsa atau token CSRF tidak valid. Silakan refresh halaman ini.",
    ctaText: "Muat ulang",
    ctaHref: url,
    LANDINGPAGE_URL,
    metaData: {
      code: 403,
      message: "Forbidden",
    },
  });
}

export const useCsrf = {
  protection,
  exposeToken,
  errorHandler,
};
