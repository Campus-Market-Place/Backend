"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireShopOwner = void 0;
const apperror_js_1 = require("../errors/apperror.js");
const prisma_js_1 = require("../lib/prisma.js");
const requireShopOwner = () => {
    return async (req, _res, next) => {
        if (!req.user) {
            throw new apperror_js_1.UnauthorizedError();
        }
        const userId = req.user.id;
        const shopId = req.shop?.id ?? req.params?.shopId;
        if (!shopId || Array.isArray(shopId)) {
            throw new apperror_js_1.NotFoundError("Shop not found");
        }
        const shop = await prisma_js_1.prisma.shop.findUnique({
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
            throw new apperror_js_1.NotFoundError("Shop not found");
        }
        if (shop.seller?.user?.id === userId) {
            throw new apperror_js_1.ConflictError("You cannot perform this action on your own shop");
        }
        next();
    };
};
exports.requireShopOwner = requireShopOwner;
//# sourceMappingURL=shopowner.middleware.js.map