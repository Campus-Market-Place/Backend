import { NextFunction, Request, Response } from 'express';
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from '../errors/apperror.js';
import { config } from '../config.js';
import { prisma } from '../lib/prisma.js';

export const validateShop = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {

    const { shopId } = req.params || req.body;

    if (!shopId || Array.isArray(shopId)) {
            throw new ConflictError('shop id is required and must be a string');
        }

     const shop =await prisma.shop.findUnique({
        where : {id : shopId}
    });

    if (!shop) {
        throw new NotFoundError('Shop not found'); 
    }

    req.shop = shop.id;

    next();
  };
}

// validate category
export const validateCategory = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {

    const { categoryId } = req.params || req.body;

    if (!categoryId || Array.isArray(categoryId)) {
            throw new ConflictError('category id is required and must be a string');
        }

     const category =await prisma.category.findUnique({
        where : {id : categoryId}
    });

    if (!category) {
        throw new NotFoundError('Category not found'); 
    }

    req.category = category.id;

    next();
  };
}