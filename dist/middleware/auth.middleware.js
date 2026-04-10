"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const apperror_js_1 = require("../errors/apperror.js");
const prisma_js_1 = require("../lib/prisma.js");
const jwt_js_1 = require("../lib/jwt.js");
async function authMiddleware(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new apperror_js_1.UnauthorizedError('Missing or invalid authorization header');
    }
    const token = authHeader.replace('Bearer ', '').trim();
    let payload;
    try {
        payload = (0, jwt_js_1.verifyJwt)(token);
    }
    catch {
        throw new apperror_js_1.UnauthorizedError('Invalid or expired token');
    }
    const user = await prisma_js_1.prisma.user.findUnique({
        where: { id: payload.sub },
    });
    if (!user || user.deletedAt) {
        throw new apperror_js_1.ForbiddenError('User not found or deactivated');
    }
    req.user = {
        id: user.id,
        username: user.username,
        role: user.role,
    };
    next();
}
//# sourceMappingURL=auth.middleware.js.map