"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavedProducts = exports.unsaveProduct = exports.saveProduct = void 0;
const prisma_js_1 = require("../lib/prisma.js");
const wrapper_js_1 = require("../middleware/wrapper.js");
const apperror_js_1 = require("../errors/apperror.js");
const logger_js_1 = require("../lib/logger.js");
exports.saveProduct = (0, wrapper_js_1.catchAsync)(async (req, res) => {
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
    await prisma_js_1.prisma.fevorite.create({
        data: {
            userid: userId,
            productid: productId,
        },
    });
    logger_js_1.logger.info({
        event: 'product_saved',
        requestId: req.requestId,
        userId,
        productId,
    });
    res.status(200).json({ message: "Product saved successfully" });
});
exports.unsaveProduct = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const productId = req.product;
    if (!productId || Array.isArray(productId)) {
        throw new apperror_js_1.ConflictError('Product id is required and must be a string');
    }
    const userId = req.user?.id;
    if (!userId)
        throw new apperror_js_1.NotFoundError("User context missing");
    await prisma_js_1.prisma.fevorite.deleteMany({
        where: {
            userid: userId,
            productid: productId,
        },
    });
    logger_js_1.logger.info({
        event: 'product_unsaved',
        requestId: req.requestId,
        userId,
        productId,
    });
    res.status(200).json({ message: "Product unsaved successfully" });
});
// get saved products
exports.getSavedProducts = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new apperror_js_1.NotFoundError("User context missing");
    const savedProducts = await prisma_js_1.prisma.fevorite.findMany({
        where: { userid: userId },
        select: {
            product: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    ratingAverage: true,
                    ratingCount: true,
                    shop: {
                        select: {
                            status: true,
                            isOpen: true
                        }
                    },
                    isActive: true,
                    images: {
                        select: {
                            imagePath: true,
                        },
                        take: 1,
                    },
                },
            }
        }
    });
    logger_js_1.logger.info({
        event: 'saved_products_fetched',
        requestId: req.requestId,
        userId,
    });
    const data = savedProducts.map((item) => item.product);
    res.status(200).json({ data });
});
//# sourceMappingURL=save_product.controller.js.map