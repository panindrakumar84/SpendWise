import { User } from "@repositories/user.repository.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
      };
    }
  }
}

export {};
