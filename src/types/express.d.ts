import "express";

declare global {
  namespace Express {

    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
    interface Request {
      user?: {
        id: string;
        username: string;
        role: string;
      };
      session?: any;
      requestId?: string;      // request ID for tracking

      context?: {
        models: {
          shop: any; // replace when you have actual types
          category: any;
          product: any;
        };
      };
      shop?: any;
      category?: any;
      product?: any;
    }
  }
}
