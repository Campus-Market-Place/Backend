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

      context?: {
      models: {
        shop: any; // replace when you have actual types
        category : any;
      };
    };
    shop?: any;
    category?: any;
    }
  }
}
