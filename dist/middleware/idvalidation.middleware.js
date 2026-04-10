"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProduct = exports.validateCategory = exports.validateShop = void 0;
const apperror_js_1 = require("../errors/apperror.js");
const prisma_js_1 = require("../lib/prisma.js");
const auth_js_1 = require("../constants/auth.js");
const validateShop = () => {
    return async (req, _res, next) => {
        const shopId = req.body?.shopId ??
            req.params?.shopId;
        console.log("Validating shop with ID:", shopId);
        if (!shopId || Array.isArray(shopId)) {
            throw new apperror_js_1.ConflictError('shop id is required and must be a string');
        }
        const shop = await prisma_js_1.prisma.shop.findFirst({
            where: { id: shopId, status: { in: [auth_js_1.SellerStatuses.APPROVED, auth_js_1.SellerStatuses.WARNING] } }
        });
        console.log("Shop found in validation middleware:", shop);
        if (!shop) {
            throw new apperror_js_1.NotFoundError('Shop not found');
        }
        req.shop = shop;
        next();
    };
};
exports.validateShop = validateShop;
// validate category
const validateCategory = () => {
    return async (req, _res, next) => {
        const categoryId = req.body?.categoryId ??
            req.params?.categoryId;
        // 1️⃣ Validate presence & type
        if (!categoryId || typeof categoryId !== 'string') {
            throw new apperror_js_1.ConflictError('categoryId is required and must be a string');
        }
        // 2️⃣ (Optional but recommended) UUID format check
        if (!/^[0-9a-fA-F-]{36}$/.test(categoryId)) {
            throw new apperror_js_1.ConflictError('Invalid categoryId format');
        }
        // 3️⃣ Query Prisma correctly
        const category = await prisma_js_1.prisma.category.findUnique({
            where: { id: categoryId }, // ✅ STRING ONLY
        });
        if (!category) {
            throw new apperror_js_1.NotFoundError('Category not found');
        }
        // 4️⃣ Attach clean value to request
        req.category = category.id;
        next();
    };
};
exports.validateCategory = validateCategory;
// export const validateCategory = () => {
//   return async (req: Request, _res: Response, next: NextFunction) => {
//     const categoryId = req.body;
//     if (!categoryId || Array.isArray(categoryId)) {
//             throw new ConflictError('category id is required and must be a string');
//         }
//      const category =await prisma.category.findUnique({
//         where : {id : categoryId}
//     });
//     if (!category) {
//         throw new NotFoundError('Category not found'); 
//     }
//     req.category = category.id;
//     next();
//   };
// }
const validateProduct = () => {
    return async (req, _res, next) => {
        const productId = req.body?.productId ?? req.params?.productId ?? req.query?.productId;
        console.log("Validating product with ID:", productId);
        if (!productId || Array.isArray(productId)) {
            throw new apperror_js_1.ConflictError('product id is required and must be a string');
        }
        const product = await prisma_js_1.prisma.product.findUnique({
            where: { id: productId }
        });
        if (!product) {
            throw new apperror_js_1.NotFoundError('Product not found');
        }
        console.log("Product found in validation middleware:", product);
        req.product = product.id;
        next();
    };
};
exports.validateProduct = validateProduct;
//# sourceMappingURL=idvalidation.middleware.js.map