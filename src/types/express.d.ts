import "express";

declare global {
  namespace Express {
    interface Request {
      user?: string;      // your user ID or a user object
      session?: any;
      requestId?: string;      // request ID for tracking
    }
  }
}
