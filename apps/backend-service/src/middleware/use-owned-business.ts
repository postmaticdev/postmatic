import { Request, Response, NextFunction } from "express";
import db from "../config/db";
import { cachedOwnedBusinesses } from "../config/cache";

/** Ambil ulang dari DB lalu set ke cache */
async function loadAndCacheOwnedBusinesses(
  profileId: string
): Promise<string[]> {
  const businesses = await db.rootBusiness.findMany({
    where: {
      AND: [
        { deletedAt: null },
        {
          members: {
            some: { profileId },
          },
        },
      ],
    },
    select: { id: true },
  });

  const owned = businesses.map((b) => b.id);
  await cachedOwnedBusinesses.set(profileId, owned);
  return owned;
}

export const useOwnedBusiness = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        metaData: { code: 401, message: "Unauthorized" },
        responseMessage: "Unauthorized",
      });
    }

    const profileId = req.user.id as string;
    const { rootBusinessId } = req.params as { rootBusinessId?: string };

    // Jika route tidak butuh rootBusinessId, lanjutkan saja
    if (!rootBusinessId) return next();

    // Attempt #1: pakai cache (atau isi cache jika miss)
    let ownedBusinesses = await cachedOwnedBusinesses.get(profileId);
    if (!ownedBusinesses) {
      ownedBusinesses = await loadAndCacheOwnedBusinesses(profileId);
    }

    // Cek akses dari attempt #1
    let hasAccess = ownedBusinesses.includes(rootBusinessId);

    // Jika gagal, Attempt #2: refresh paksa dari DB (handle cache stale)
    if (!hasAccess) {
      const refreshed = await loadAndCacheOwnedBusinesses(profileId);
      hasAccess = refreshed.includes(rootBusinessId);
    }

    if (!hasAccess) {
      return res.status(403).json({
        metaData: { code: 403, message: "Forbidden" },
        responseMessage: "You are not allowed to access this resource",
      });
    }

    return next();
  } catch (error) {
    console.error("OWNED BUSINESS ERROR:", error);
    return res.status(500).json({
      metaData: { code: 500, message: "Internal Server Error" },
      responseMessage: "Internal Server Error",
    });
  }
};
