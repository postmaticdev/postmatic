import { Request, Response, NextFunction } from "express";
import db from "../config/db";
import { cachedOwnedBusinesses } from "../config/cache";

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

    const profileId = req.user.id;
    const { rootBusinessId } = req.params;

    if (!rootBusinessId) {
      return next();
    }

    let ownedBusinesses = await cachedOwnedBusinesses.get(profileId);

    if (!ownedBusinesses) {
      const businesses = await db.rootBusiness.findMany({
        where: {
          AND: [
            {
              members: {
                some: {
                  profileId,
                },
              },
            },
            {
              deletedAt: null,
            },
          ],
        },
      });

      ownedBusinesses = businesses.map((b) => b.id);
      await cachedOwnedBusinesses.set(profileId, ownedBusinesses);
    }

    const hasAccess = ownedBusinesses.includes(rootBusinessId);

    if (!hasAccess) {
      return res.status(403).json({
        metaData: { code: 403, message: "Forbidden" },
        responseMessage: "You are not allowed to access this resource",
      });
    }

    return next();
  } catch (error) {
    console.error("OWNED BUSINESS ERROR: ", error);
    return res.status(500).json({
      metaData: { code: 500, message: "Internal Servel Error" },
      responseMessage: "Internal Servel Error",
    });
  }
};
