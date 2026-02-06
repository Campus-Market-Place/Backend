import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/apperror.js';
import { config } from '../config.js';

export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
};

export const requireAdmin = () => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (!config.adminUsernames.length) {
      throw new ForbiddenError('Admin access not configured');
    }
    if (!config.adminUsernames.includes(req.user.username)) {
      throw new ForbiddenError('Admin access required');
    }
    next();
  };
};


// is seller 
export const requireSeller = () => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    if (!req.user.role || req.user.role !== 'SELLER') {
        throw new UnauthorizedError('Seller role required');
    }

    if (req.user.sellerStatus !== 'APPROVED') {
      throw new ForbiddenError('Seller access required');
    }
    next();
  };
}