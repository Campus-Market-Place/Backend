import { ConflictError, NotFoundError } from "../errors/apperror";
import { catchAsync } from "../middleware/wrapper";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

const trackEngagement = async (params: {
    userId: string;
    shopId: string;
    action: "VIEW" | "SOCIAL_MEDIA_CHECK" | "CONTACT_CLICK";
    analyticsField: "views" | "socialChecks" | "contacts";
    today: Date;
}) => {
    const { userId, shopId, action, analyticsField, today } = params;

    await prisma.$transaction([
        prisma.interaction.upsert({
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
        }),
        prisma.shopAnalyticsDaily.upsert({
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
        }),
    ]);
};

const getValidatedEngagementContext = (req: Request) => {
    const shopId = req.shop?.id;

    if (!shopId || Array.isArray(shopId)) {
        throw new ConflictError("Shop id is required and must be a string");
    }

    const userId = req.user?.id;

    if (!userId) {
        throw new NotFoundError("User context missing");
    }

    return { shopId, userId };
};

const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

export const view = catchAsync(async (req: Request, res: Response) => {
    const { shopId, userId } = getValidatedEngagementContext(req);
    const today = getStartOfToday();

    await trackEngagement({
        userId,
        shopId,
        action: "VIEW",
        analyticsField: "views",
        today,
    });

    logger.info({
        event: "shop_view",
        requestId: req.requestId,
        userId,
        shopId,
    });

    res.json({ success: true });
});

export const socialMediaClick = catchAsync(async (req: Request, res: Response) => {
    const { shopId, userId } = getValidatedEngagementContext(req);
    const today = getStartOfToday();

    await trackEngagement({
        userId,
        shopId,
        action: "SOCIAL_MEDIA_CHECK",
        analyticsField: "socialChecks",
        today,
    });

    logger.info({
        event: "shop_social_media_click",
        requestId: req.requestId,
        userId,
        shopId,
    });

    res.json({ success: true });
});

export const contactClick = catchAsync(async (req: Request, res: Response) => {
    const { shopId, userId } = getValidatedEngagementContext(req);
    const today = getStartOfToday();

    await trackEngagement({
        userId,
        shopId,
        action: "CONTACT_CLICK",
        analyticsField: "contacts",
        today,
    });

    logger.info({
        event: "shop_contact_click",
        requestId: req.requestId,
        userId,
        shopId,
    });

    res.json({ success: true });
});
