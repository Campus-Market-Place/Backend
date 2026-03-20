import { NextFunction, Request, Response } from 'express';
import { ConflictError, NotFoundError, UnauthorizedError } from '../errors/apperror.js';
import { prisma } from '../lib/prisma.js';

export const requireShopOwner = () => {
    return async (req: Request, _res: Response, next: NextFunction) => {

        if (!req.user) {
            throw new UnauthorizedError();
        }

        const userId = req.user.id;
        const shopId = req.shop?.id ?? req.params?.shopId;

        if (!shopId || Array.isArray(shopId)) {
            throw new NotFoundError("Shop not found");
        }

        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
            select: {
                seller: {
                    select: {
                        user: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
            },
        });

        if (!shop) {
            throw new NotFoundError("Shop not found");
        }

        if (shop.seller?.user?.id === userId) {
            throw new ConflictError("You cannot perform this action on your own shop");
        }

        next();
    };
};