import { ConflictError, NotFoundError } from "../errors/apperror";
import { catchAsync } from "../middleware/wrapper";
import { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

const trackEngagement = async (
    tx: Prisma.TransactionClient,
    params: {
        userId: string;
        shopId: string;
        action: "VIEW" | "SOCIAL_MEDIA_CHECK" | "CONTACT_CLICK";
        analyticsField: "views" | "socialChecks" | "contacts";
        today: Date;
    }
) => {
    const { userId, shopId, action, analyticsField, today } = params;

    await tx.interaction.upsert({
        where: {
            shopId_userId_action: {
                userId,
                shopId,
                action,
            },
        },
        update: {
            count: { increment: 1 },
        },
        create: {
            userId,
            shopId,
            action,
        },
    });

    await tx.shopAnalyticsDaily.upsert({
        where: {
            shopId_date: {
                shopId,
                date: today,
            },
        },
        update: {
            [analyticsField]: { increment: 1 },
        },
        create: {
            shopId,
            date: today,
            [analyticsField]: 1,
        },
    });
};

export const view = catchAsync(async (req: Request, res: Response) => {

    const shopId = req.shop?.id;

    if (!shopId || Array.isArray(shopId)) {
        throw new ConflictError('Shop id is required and must be a string');
    }

    const userId = req.user?.id;

    if (!userId) throw new NotFoundError("User context missing");


    const today = new Date();
    today.setHours(0, 0, 0, 0)

    const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {

            await trackEngagement(tx, {
                userId,
                shopId,
                action: "VIEW",
                analyticsField: "views",
                today,
            });


            return true;
        }
    )


    if (!result) {
        throw new ConflictError("Failed to update engagement metrics");
    }

    logger.info({
        event: 'shop_view',
        requestId: req.requestId,
        userId,
        shopId,
    })

    res.json({ success: true, data: result });
}
)


export const socialMediaClick = catchAsync(async (req: Request, res: Response) => {

    const shopId = req.shop?.id;

    if (!shopId || Array.isArray(shopId)) {
        throw new ConflictError('Shop id is required and must be a string');
    }

    const userId = req.user?.id;

    if (!userId) throw new NotFoundError("User context missing");


    const today = new Date();
    today.setHours(0, 0, 0, 0)

    const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
            await trackEngagement(tx, {
                userId,
                shopId,
                action: "SOCIAL_MEDIA_CHECK",
                analyticsField: "socialChecks",
                today,
            });

            return true;
        }
    )


    if (!result) {
        throw new ConflictError("Failed to update social media click metrics");
    }

    logger.info({
        event: 'shop_social_media_click',
        requestId: req.requestId,
        userId,
        shopId,
    })

    res.json({ success: true, data: result });
}
)


export const contactClick = catchAsync(async (req: Request, res: Response) => {

    const shopId = req.shop?.id;

    if (!shopId || Array.isArray(shopId)) {
        throw new ConflictError('Shop id is required and must be a string');
    }

    const userId = req.user?.id;

    if (!userId) throw new NotFoundError("User context missing");


    const today = new Date();
    today.setHours(0, 0, 0, 0)

    const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
            await trackEngagement(tx, {
                userId,
                shopId,
                action: "CONTACT_CLICK",
                analyticsField: "contacts",
                today,
            });

            return true;
        }
    )


    if (!result) {
        throw new ConflictError("Failed to update contact click metrics");
    }

    logger.info({
        event: 'shop_contact_click',
        requestId: req.requestId,
        userId,
        shopId,
    })

    res.json({ success: true, data: result });
}
)
