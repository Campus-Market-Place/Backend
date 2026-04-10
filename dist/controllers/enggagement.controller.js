"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactClick = exports.socialMediaClick = exports.view = void 0;
const apperror_1 = require("../errors/apperror");
const wrapper_1 = require("../middleware/wrapper");
const prisma_js_1 = require("../lib/prisma.js");
const logger_js_1 = require("../lib/logger.js");
const trackEngagement = async (params) => {
    const { userId, shopId, action, analyticsField, today } = params;
    await prisma_js_1.prisma.$transaction([
        prisma_js_1.prisma.interaction.upsert({
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
        prisma_js_1.prisma.shopAnalyticsDaily.upsert({
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
const getValidatedEngagementContext = (req) => {
    const shopId = req.shop?.id;
    if (!shopId || Array.isArray(shopId)) {
        throw new apperror_1.ConflictError("Shop id is required and must be a string");
    }
    const userId = req.user?.id;
    if (!userId) {
        throw new apperror_1.NotFoundError("User context missing");
    }
    return { shopId, userId };
};
const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};
exports.view = (0, wrapper_1.catchAsync)(async (req, res) => {
    const { shopId, userId } = getValidatedEngagementContext(req);
    const today = getStartOfToday();
    await trackEngagement({
        userId,
        shopId,
        action: "VIEW",
        analyticsField: "views",
        today,
    });
    logger_js_1.logger.info({
        event: "shop_view",
        requestId: req.requestId,
        userId,
        shopId,
    });
    res.json({ success: true });
});
exports.socialMediaClick = (0, wrapper_1.catchAsync)(async (req, res) => {
    const { shopId, userId } = getValidatedEngagementContext(req);
    const today = getStartOfToday();
    await trackEngagement({
        userId,
        shopId,
        action: "SOCIAL_MEDIA_CHECK",
        analyticsField: "socialChecks",
        today,
    });
    logger_js_1.logger.info({
        event: "shop_social_media_click",
        requestId: req.requestId,
        userId,
        shopId,
    });
    res.json({ success: true });
});
exports.contactClick = (0, wrapper_1.catchAsync)(async (req, res) => {
    const { shopId, userId } = getValidatedEngagementContext(req);
    const today = getStartOfToday();
    await trackEngagement({
        userId,
        shopId,
        action: "CONTACT_CLICK",
        analyticsField: "contacts",
        today,
    });
    logger_js_1.logger.info({
        event: "shop_contact_click",
        requestId: req.requestId,
        userId,
        shopId,
    });
    res.json({ success: true });
});
//# sourceMappingURL=enggagement.controller.js.map