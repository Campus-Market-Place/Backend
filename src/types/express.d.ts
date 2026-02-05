import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: string;
        sellerStatus: string;
      };
      session?: any;
      requestId?: string;      // request ID for tracking
    }
  }
}
