"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShop = void 0;
const wrapper_js_1 = require("../middleware/wrapper.js");
const prisma_js_1 = require("../lib/prisma.js");
const apperror_js_1 = require("../errors/apperror.js");
const logger_js_1 = require("../lib/logger.js");
// get shop details for a product
exports.getShop = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const id = req.shop.id;
    // Ensure id is a string
    if (!id || typeof id !== "string") {
        throw new apperror_js_1.NotFoundError("Invalid shop id");
    }
    const shop = await prisma_js_1.prisma.shop.findUnique({
        where: { id, status: { in: ["APPROVED", "WARNING"] } },
        select: {
            id: true,
            shopName: true,
            bio: true,
            rating: true,
            isOpen: true,
            status: true,
            followersCount: true,
            profileImageUrl: true,
            products: {
                where: { status: "APPROVED", isActive: true },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    categoryId: true,
                    varified: true,
                    status: true,
                    ratingAverage: true,
                    ratingCount: true,
                    images: {
                        where: { status: "APPROVED" },
                        select: { imagePath: true },
                        take: 1, // Get only one approved image for preview
                    },
                },
            },
            seller: {
                select: {
                    user: {
                        select: {
                            username: true,
                            telegramId: true,
                        },
                    },
                    instagram: true || null,
                    telegram: true || null,
                    tiktok: true || null,
                    other: true || null,
                    mainPhone: true,
                    secondaryPhone: true || null,
                },
            },
        },
    });
    if (!shop) {
        throw new apperror_js_1.NotFoundError("Shop not found");
    }
    await prisma_js_1.prisma.follow.findUnique({
        where: {
            userId_shopId: {
                userId: req.user?.id || "",
                shopId: shop.id || "",
            },
            isActive: true,
        },
    }).then((follow) => {
        // Add isFollowed property to shop object
        shop.isFollowed = follow?.isActive;
    });
    logger_js_1.logger.info({
        event: 'shop_details_fetched',
        requestId: req.requestId,
        shopId: id,
    });
    res.status(200).json({ data: { shop }, message: "Shop details fetched successfully" });
});
//# sourceMappingURL=shop.controller.js.map