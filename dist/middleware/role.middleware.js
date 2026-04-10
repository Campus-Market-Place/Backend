"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireActiveSeller = exports.requireAdmin = exports.requireRole = void 0;
const apperror_js_1 = require("../errors/apperror.js");
const config_js_1 = require("../config.js");
const prisma_js_1 = require("../lib/prisma.js");
const requireRole = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new apperror_js_1.UnauthorizedError();
        }
        if (!roles.includes(req.user.role)) {
            throw new apperror_js_1.ForbiddenError('Insufficient permissions');
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireAdmin = () => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new apperror_js_1.UnauthorizedError();
        }
        if (!config_js_1.config.adminUsernames.length) {
            throw new apperror_js_1.ForbiddenError('Admin access not configured');
        }
        if (!config_js_1.config.adminUsernames.includes(req.user.username)) {
            throw new apperror_js_1.ForbiddenError('Admin access required');
        }
        next();
    };
};
exports.requireAdmin = requireAdmin;
// is seller 
const requireActiveSeller = () => {
    return async (req, _res, next) => {
        try {
            if (!req.user) {
                throw new apperror_js_1.UnauthorizedError();
            }
            if (req.user.role !== 'SELLER') {
                throw new apperror_js_1.UnauthorizedError('Seller account required');
            }
            const seller = await prisma_js_1.prisma.sellerProfile.findUnique({
                where: { userId: req.user.id },
                include: { shop: true },
            });
            if (!seller) {
                throw new apperror_js_1.UnauthorizedError('Seller account required');
            }
            if (!seller.shop) {
                throw new apperror_js_1.UnauthorizedError('Shop not found');
            }
            if (seller.shop.status === 'SUSPENDED') {
                throw new apperror_js_1.ForbiddenError(`Shop is ${seller.shop.status.toLowerCase()} ,you can send us you appeal.`);
            }
            req.shop = seller.shop;
            next(); // ✅ Only call next if everything is fine
        }
        catch (err) {
            console.error('Error in requireActiveSeller middleware:', err);
            next(err); // ✅ Pass errors to your errorHandler
        }
    };
};
exports.requireActiveSeller = requireActiveSeller;
// export const requireActiveSeller = () => {
//   return async (req: Request, _res: Response, next: NextFunction) => {
//     if (!req.user) {
//       throw new UnauthorizedError();
//     }
//     if (req.user.role !== 'SELLER') {
//       throw new UnauthorizedError('Seller account required');
//     }
//     // 1️⃣ Must have seller profile
//     const seller = await prisma.sellerProfile.findUnique({
//       where: { userId: req.user.id },
//       include: { shop: true },
//     });
//     if (!seller) {
//       throw new UnauthorizedError('Seller account required');
//     }
//     // 2️⃣ Must have a shop
//     if (!seller.shop) {
//       throw new UnauthorizedError('Shop not found');
//     }
//     // 3️⃣ Shop must be ACTIVE
//     if (seller.shop.status === 'SUSPENDED') {
//       throw new ForbiddenError(
//         `Shop is ${seller.shop.status.toLowerCase()} ,you can send us you appeal.`
//       );
//     }
//     // Optional: attach for later handlers
//     // req.seller = seller;
//     req.shop = seller.shop;
//     next();
//   };
// };
//# sourceMappingURL=role.middleware.js.map