"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const idvalidation_middleware_js_1 = require("../middleware/idvalidation.middleware.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const review_validation_js_1 = require("../validation/review.validation.js");
const review_controller_js_1 = require("../controllers/review.controller.js");
const shopowner_middleware_js_1 = require("../middleware/shopowner.middleware.js");
exports.reviewRouter = (0, express_1.Router)();
exports.reviewRouter.post('/:shopId/:productId', auth_middleware_js_1.authMiddleware, (0, idvalidation_middleware_js_1.validateShop)(), (0, idvalidation_middleware_js_1.validateProduct)(), (0, validate_middleware_js_1.validateBody)(review_validation_js_1.ReviewSchema), (0, shopowner_middleware_js_1.requireShopOwner)(), review_controller_js_1.createReview);
exports.reviewRouter.get('/:productId', auth_middleware_js_1.authMiddleware, (0, idvalidation_middleware_js_1.validateProduct)(), review_controller_js_1.getReviewsByProduct);
exports.reviewRouter.get('/:shopId', auth_middleware_js_1.authMiddleware, (0, role_middleware_js_1.requireActiveSeller)(), (0, idvalidation_middleware_js_1.validateShop)(), review_controller_js_1.getReviewsByshop);
//# sourceMappingURL=review.router.js.map