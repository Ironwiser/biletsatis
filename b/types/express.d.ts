import pg from "pg";

declare global {
  namespace Express {
    interface Request {
      db?: pg.Pool;
      user?: {
        userId: string;
        email: string;
        role: "user" | "organizer" | "admin";
      };
    }
  }
}

export {};

