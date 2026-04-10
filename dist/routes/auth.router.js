"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const auth_validation_js_1 = require("../validation/auth.validation.js");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.get('/me', auth_controller_js_1.me);
exports.authRouter.post('/login', (0, validate_middleware_js_1.validateBody)(auth_validation_js_1.telegramLoginSchema), auth_controller_js_1.login);
exports.authRouter.post('/telegram', auth_controller_js_1.telegramLogin);
//# sourceMappingURL=auth.router.js.map