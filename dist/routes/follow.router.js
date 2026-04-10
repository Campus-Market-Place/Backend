"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const idvalidation_middleware_js_1 = require("../middleware/idvalidation.middleware.js");
const follow_controller_js_1 = require("../controllers/follow.controller.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
const shopowner_middleware_js_1 = require("../middleware/shopowner.middleware.js");
exports.followRouter = (0, express_1.Router)();
exports.followRouter.post('/:shopId', auth_middleware_js_1.authMiddleware, (0, idvalidation_middleware_js_1.validateShop)(), (0, shopowner_middleware_js_1.requireShopOwner)(), follow_controller_js_1.toggleFollowShop);
exports.followRouter.get('/:shopId', auth_middleware_js_1.authMiddleware, (0, role_middleware_js_1.requireActiveSeller)(), (0, idvalidation_middleware_js_1.validateShop)(), follow_controller_js_1.getShopFollowers);
//# sourceMappingURL=follow.router.js.map