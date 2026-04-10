"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShopFollowers = exports.toggleFollowShop = void 0;
const prisma_js_1 = require("../lib/prisma.js");
const wrapper_js_1 = require("../middleware/wrapper.js");
const apperror_js_1 = require("../errors/apperror.js");
const logger_js_1 = require("../lib/logger.js");
const Telegram_webhook_js_1 = require("../lib/Telegram_webhook.js");
exports.toggleFollowShop = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const shopId = req.shop?.id;
    if (!shopId || Array.isArray(shopId)) {
        throw new apperror_js_1.ConflictError("Shop id is required and must be a string");
    }
    const userId = req.user?.id;
    if (!userId)
        throw new apperror_js_1.NotFoundError("User context missing");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = await prisma_js_1.prisma.$transaction(async (tx) => {
        const existingFollow = await tx.follow.findUnique({
            where: {
                userId_shopId: { userId, shopId },
            },
        });
        let action;
        let isfirst = false;
        // case1 - first time follow
        if (!existingFollow) {
            await tx.follow.create({
                data: { userId, shopId },
            });
            action = "followed";
            isfirst = true;
        }
        // case2 - refollow after unfollowing
        else if (!existingFollow.isActive) {
            await tx.follow.update({
                where: { id: existingFollow.id },
                data: { isActive: true },
            });
            action = "followed";
        }
        // case3 - unfollowing
        else {
            await tx.follow.update({
                where: { id: existingFollow.id },
                data: { isActive: false },
            });
            action = "unfollowed";
        }
        // 🔹 Update shop followers count
        await tx.shop.update({
            where: { id: shopId },
            data: { followersCount: (action === "followed") ? { increment: 1 } : { decrement: 1 } },
        });
        // 🔹 Update daily analytics
        const updateData = {
            followers: (action === "followed") ? { increment: 1 } : { decrement: 1 },
        };
        if (isfirst) {
            updateData.uniqueFollower = { increment: 1 };
        }
        await tx.shopAnalyticsDaily.upsert({
            where: {
                shopId_date: {
                    shopId,
                    date: today,
                },
            },
            update: updateData,
            create: {
                shopId,
                date: today,
                followers: action === "followed" ? 1 : 0,
                uniqueFollower: isfirst ? 1 : 0,
            },
        });
        return { action };
    });
    if (result.action === "followed") {
        // Send notification to shop owner
        const shop = await prisma_js_1.prisma.shop.findUnique({
            where: { id: shopId },
            include: {
                seller: {
                    include: { user: { select: { telegramchatId: true } } }
                }
            },
        });
        const ownerChatId = shop?.seller?.user?.telegramchatId;
        const isValidChatId = typeof ownerChatId === "string" && /^-?\d+$/.test(ownerChatId);
        if (shop && isValidChatId) {
            try {
                await (0, Telegram_webhook_js_1.sendTelegramMessage)(ownerChatId, `🎉 Your shop "${shop.shopName}" has a new follower! \n
👤 User: ${req.user?.username || "Anonymous"} \n
📈 Total Followers: ${shop.followersCount} \n
🔥 Keep posting to attract more customers! 
`);
            }
            catch (error) {
                logger_js_1.logger.warn({
                    event: "follow_notification_failed",
                    requestId: req.requestId,
                    shopId,
                    ownerChatId,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
        else if (ownerChatId) {
            logger_js_1.logger.warn({
                event: "follow_notification_skipped_invalid_chat_id",
                requestId: req.requestId,
                shopId,
                ownerChatId,
            });
        }
    }
    logger_js_1.logger.info({
        event: result.action === "followed"
            ? "shop_followed"
            : "shop_unfollowed",
        requestId: req.requestId,
        userId,
        shopId,
    });
    return res.status(200).json({
        message: result.action === "followed"
            ? "Shop followed successfully"
            : "Shop unfollowed successfully",
    });
});
// get followers of a shop
exports.getShopFollowers = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const shopId = req.shop?.id;
    if (!shopId || Array.isArray(shopId)) {
        throw new apperror_js_1.ConflictError('Shop id is required and must be a string');
    }
    const followers = await prisma_js_1.prisma.follow.findMany({
        where: { shopId, isActive: true },
        include: {
            user: {
                select: {
                    username: true,
                    telegramId: true,
                    telegramchatId: true,
                },
            },
        },
    });
    res.status(200).json({ data: { followers }, message: "Shop followers fetched successfully" });
});
//# sourceMappingURL=follow.controller.js.map