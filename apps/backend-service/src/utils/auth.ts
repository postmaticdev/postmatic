import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../constant/auth";
import db from "../config/db";
import { cachedUser } from "../config/cache";
import { z } from "zod";

dotenv.config();

export const AppUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  photo: z.string().nullable(),
});

export type AppUser = z.infer<typeof AppUserSchema>;

// Every login success will serialize the user into the session
passport.serializeUser((user: AppUser, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    // 1) coba ambil dari cache
    let user: AppUser | null = null;

    const inCache = await Promise.resolve(cachedUser.has(id)).catch(
      () => false
    );
    if (inCache) {
      const cached = await cachedUser.get(id);
      if (cached) {
        // validasi shape optional
        user = AppUserSchema.parse(cached);
      }
    }

    // 2) fallback ke DB jika cache miss / corrupt
    if (!user) {
      const profile = await db.profile.findUnique({
        where: { id },
        select: { id: true, name: true, image: true, email: true },
      });

      if (!profile) {
        // Jangan lempar error; tandai sesi invalid saja
        return done(null, false);
      }

      user = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        photo: profile.image,
      };

      // tulis ke cache tapi jangan ganggu alur bila gagal
      cachedUser.set(id, user).catch(() => {});
    }

    return done(null, user);
  } catch (err) {
    console.error("deserializeUser error:", err);
    // Hindari melempar error supaya Passport tidak panik
    return done(null, false);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/callback/google",
    },
    async (accessToken, refreshToken, profile, done) => {
      const provider = "google";

      if (
        !profile.emails ||
        !profile.emails.length ||
        !profile.emails[0].value
      ) {
        return done(new Error("No email found in profile"));
      }

      const profileFromDb = await db.profile.findUnique({
        where: {
          email: profile.emails[0].value,
        },
        select: {
          id: true,
          name: true,
          image: true,
          users: {
            select: {
              provider: true,
            },
          },
        },
      });

      if (!profileFromDb) {
        // If user not found, create a new user
        const profileCreated = await db.profile.create({
          data: {
            name: profile.displayName || profile.name?.givenName || "Unknown",
            image: profile.photos?.[0]?.value,
            email: profile.emails[0].value,
            description: "",
            users: {
              create: {
                provider,
                email: profile.emails[0].value,
              },
            },
          },
          select: {
            id: true,
            name: true,
            image: true,
          },
        });
        const mappedUser: AppUser = {
          id: profileCreated.id,
          name: profileCreated.name,
          email: profile.emails[0].value,
          photo: profileCreated.image,
        };
        return done(null, mappedUser);
      }
      const mappedUser: AppUser = {
        id: profileFromDb.id,
        name: profileFromDb.name,
        email: profile.emails[0].value,
        photo: profileFromDb.image,
      };
      if (profileFromDb.users.every((user) => user.provider !== provider)) {
        await db.user.create({
          data: {
            profileId: profileFromDb.id,
            provider,
            email: profile.emails[0].value,
          },
        });
      }
      return done(null, mappedUser);
    }
  )
);
