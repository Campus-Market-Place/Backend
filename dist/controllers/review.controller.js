"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewsByshop = exports.getReviewsByProduct = exports.createReview = void 0;
const prisma_js_1 = require("../lib/prisma.js");
const wrapper_js_1 = require("../middleware/wrapper.js");
const apperror_js_1 = require("../errors/apperror.js");
const logger_js_1 = require("../lib/logger.js");
exports.createReview = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    // const { productId , shopId } = req.product , req.shop.id;
    const productId = req.product;
    const shopId = req.shop?.id;
    if (!productId || Array.isArray(productId)) {
        throw new apperror_js_1.ConflictError('Product id is required and must be a string');
    }
    if (!shopId || Array.isArray(shopId)) {
        throw new apperror_js_1.ConflictError('Shop id is required and must be a string');
    }
    const userId = req.user?.id;
    if (!userId)
        throw new apperror_js_1.NotFoundError("User context missing");
    const { rating, comment } = req.body;
    const result = await prisma_js_1.prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
            data: {
                productId: productId,
                shopId: shopId,
                userId,
                rating,
                comment,
            },
        });
        const stats = await tx.review.aggregate({
            where: { productId },
            _avg: { rating: true },
            _count: { rating: true },
        });
        const averageRating = stats._avg.rating || 0;
        const ratingCount = stats._count.rating;
        const product = await tx.product.update({
            where: { id: productId },
            data: {
                ratingAverage: averageRating,
                ratingCount,
            },
            select: {
                shopId: true,
            },
        });
        // 4️⃣ Recalculate shop rating from products
        const shopStats = await tx.product.aggregate({
            where: {
                shopId: product.shopId,
                status: "APPROVED",
                isActive: true,
                ratingCount: { gt: 0 },
            },
            _avg: { ratingAverage: true },
            _sum: { ratingCount: true },
        });
        // 5️⃣ Update shop
        await tx.shop.update({
            where: { id: product.shopId },
            data: {
                rating: shopStats._avg.ratingAverage || 0,
            },
        });
        return review;
    });
    logger_js_1.logger.info({
        event: 'review_created',
        requestId: req.requestId,
        userId,
        productId,
        rating,
    });
    res.status(201).json({
        message: "Review created successfully",
        review: result,
    });
});
// get reviews for a product with pagination
exports.getReviewsByProduct = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const id = req.product;
    let { page = "1", limit = "10" } = req.query;
    // Ensure id is a string
    if (!id || typeof id !== "string") {
        throw new apperror_js_1.NotFoundError("Invalid product id");
    }
    const reviews = await prisma_js_1.prisma.review.findMany({
        where: { productId: id },
        select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
                select: {
                    username: true,
                },
            },
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
    });
    logger_js_1.logger.info({
        event: 'reviews_fetched',
        requestId: req.requestId,
        productId: id,
        page,
        limit,
    });
    res.status(200).json({ data: { reviews }, message: "Reviews fetched successfully" });
});
// get review for a shop 
exports.getReviewsByshop = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const id = req.shop?.id;
    let { page = "1", limit = "10" } = req.query;
    // Ensure id is a string
    if (!id || typeof id !== "string") {
        throw new apperror_js_1.NotFoundError("Invalid product id");
    }
    const reviews = await prisma_js_1.prisma.review.findMany({
        where: { shopId: id },
        select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            product: {
                select: {
                    name: true
                }
            },
            user: {
                select: {
                    username: true,
                },
            },
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
    });
    logger_js_1.logger.info({
        event: 'reviews_fetched',
        requestId: req.requestId,
        productId: id,
        page,
        limit,
    });
    res.status(200).json({ data: { reviews }, message: "Reviews fetched successfully" });
});
//# sourceMappingURL=review.controller.js.map