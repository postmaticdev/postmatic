import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constant/auth";
import { AppUser } from "../utils/auth";

function extractBearer(req: Request): string | null {
  const h = req.headers.authorization;
  if (h && h.startsWith("Bearer ")) return h.slice(7).trim() || null;
  return null;
}
function extractLegacy(req: Request): string | null {
  const q =
    (req.query.postmaticAccessToken as string) ||
    (req.body?.postmaticAccessToken as string);
  return q ? String(q) : null;
}

export function useAuth(req: Request, res: Response, next: NextFunction) {
  // Jika pakai Passport session untuk sebagian route
  if (req.isAuthenticated?.() && req.user) return next();

  const token = extractBearer(req) ?? extractLegacy(req);
  if (!token) {
    res.setHeader("Deprecation", "true");
    res.setHeader("Deprecation-Reason", "Use JWT instead");

    return res.status(401).json({
      metaData: { code: 401, message: "Unauthorized" },
      responseMessage: "Unauthorized",
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AppUser;
    req.user = { ...payload, postmaticAccessToken: token };
    return next();
  } catch {
    return res.status(401).json({
      metaData: { code: 401, message: "Unauthorized" },
      responseMessage: "Unauthorized",
    });
  }
}
