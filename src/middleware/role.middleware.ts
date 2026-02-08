import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/apperror.js';
import { config } from '../config.js';
import { prisma } from '../lib/prisma.js';

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
export const requireActiveSeller = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    if (req.user.role == 'SELLER') {
      throw new UnauthorizedError('Seller account required');
    }

    // 1️⃣ Must have seller profile
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
      include: { shop: true },
    });

    if (!seller) {
      throw new UnauthorizedError('Seller account required');
    }

    // 2️⃣ Must have a shop
    if (!seller.shop) {
      throw new UnauthorizedError('Shop not found');
    }

    // 3️⃣ Shop must be ACTIVE
    if (seller.shop.status === 'SUSPENDED') {
      throw new ForbiddenError(
        `Shop is ${seller.shop.status.toLowerCase()} ,you can send us you appeal.`
      );
    }

    // Optional: attach for later handlers
    // req.seller = seller;
    req.shop = seller.shop;

    next();
  };
};

