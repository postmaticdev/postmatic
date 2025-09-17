import { FilterQueryType } from "src/middleware/use-filter";
import { AppUser } from "../utils/auth";
import { Request } from "express";

declare global {
  namespace Express {
    interface User extends AppUser {
      postmaticAccessToken?: string;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    state?: string;
    oauth_state?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      filterQuery?: FilterQueryType;
      turnstile?: {
        ok: boolean;
        code?: string;
        message?: string;
        raw?: any;
      };
    }
  }
}
