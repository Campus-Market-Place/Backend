"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.get('/me', auth_middleware_js_1.authMiddleware, auth_controller_js_1.me);
//# sourceMappingURL=user.router.js.map