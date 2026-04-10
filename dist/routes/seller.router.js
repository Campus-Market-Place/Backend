"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const seller_controller_js_1 = require("../controllers/seller.controller.js");
const seller_validation_js_1 = require("../validation/seller.validation.js");
const uplode_js_1 = require("../lib/uplode.js");
const idvalidation_middleware_js_1 = require("../middleware/idvalidation.middleware.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
exports.sellerRouter = (0, express_1.Router)();
exports.sellerRouter.post('/seller-request', uplode_js_1.uploadSellerImages, auth_middleware_js_1.authMiddleware, (0, idvalidation_middleware_js_1.validateCategory)(), (0, validate_middleware_js_1.validateBody)(seller_validation_js_1.sellerRequestSchema), seller_controller_js_1.submitSellerRequest);
exports.sellerRouter.get('/seller-profile', auth_middleware_js_1.authMiddleware, (0, role_middleware_js_1.requireActiveSeller)(), seller_controller_js_1.getSellerProfile);
exports.sellerRouter.put('/seller-profile', uplode_js_1.uploadupdateImages, auth_middleware_js_1.authMiddleware, (0, role_middleware_js_1.requireActiveSeller)(), (0, validate_middleware_js_1.validateBody)(seller_validation_js_1.sellerUpdateSchema), seller_controller_js_1.updateSellerProfile);
//# sourceMappingURL=seller.router.js.map