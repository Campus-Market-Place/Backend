import { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { catchAsync } from "../middleware/wrapper.js";
import { NotFoundError, ConflictError } from "../errors/apperror.js";
import { logger } from "../lib/logger.js";


export const toggleFollowShop = catchAsync(async (req: Request, res: Response) => {
    const  shopId  = req.shop?.id;

    if (!shopId || Array.isArray(shopId)) {
        throw new ConflictError('Shop id is required and must be a string');
    }

    const userId = req.user?.id;

    if (!userId) throw new NotFoundError("User context missing");


    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        const existingFollow = await tx.follow.findUnique({
            where: {
                userId_shopId: {
                    userId,
                    shopId,
                },
            },
        });

        if (existingFollow) {
            await tx.follow.delete({
                where: { id: existingFollow.id },
            });

            logger.info({
                event: 'shop_unfollowed',
                requestId: req.requestId,
                userId,
                shopId,
            });

            return res.status(200).json({ message: "Shop unfollowed successfully" });
        }

        await tx.follow.create({
            data: {
                userId,
                shopId,
            }
        });


        const result = await tx.follow.aggregate({
            where: { shopId },
            _count: { id: true },
        });
        const followersCount = result._count.id;
        await tx.shop.update({
            where: { id: shopId },
            data: { followersCount },
        });

        logger.info({
            event: 'shop_followed',
            requestId: req.requestId,
            userId,
            shopId,
        });

        res.status(200).json({ message: "Shop followed successfully" });

    });
});


// get followers of a shop
export const getShopFollowers = catchAsync(async (req: Request, res: Response) => {
    const shopId  = req.shop?.id;

    if (!shopId || Array.isArray(shopId)) {
        throw new ConflictError('Shop id is required and must be a string');
    }

    const followers = await prisma.follow.findMany({
        where: { shopId },
        include: {
            user: {
                select: {
                    username: true,
                    telegramId: true,
                },
            },
        },
    });

    res.status(200).json({ data: { followers }, message: "Shop followers fetched successfully" });
});