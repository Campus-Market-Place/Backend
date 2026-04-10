"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enggagementRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const idvalidation_middleware_js_1 = require("../middleware/idvalidation.middleware.js");
const enggagement_controller_js_1 = require("../controllers/enggagement.controller.js");
const statstics_controller_js_1 = require("../controllers/statstics.controller.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
exports.enggagementRouter = (0, express_1.Router)();
exports.enggagementRouter.post('/:shopId/view', auth_middleware_js_1.authMiddleware, (0, idvalidation_middleware_js_1.validateShop)(), enggagement_controller_js_1.view);
exports.enggagementRouter.post('/:shopId/social-media-click', auth_middleware_js_1.authMiddleware, (0, idvalidation_middleware_js_1.validateShop)(), enggagement_controller_js_1.socialMediaClick);
exports.enggagementRouter.post('/:shopId/contact-click', auth_middleware_js_1.authMiddleware, (0, idvalidation_middleware_js_1.validateShop)(), enggagement_controller_js_1.contactClick);
exports.enggagementRouter.get('/:shopId/statistics', auth_middleware_js_1.authMiddleware, (0, role_middleware_js_1.requireActiveSeller)(), (0, idvalidation_middleware_js_1.validateShop)(), statstics_controller_js_1.getShopStatistics);
//# sourceMappingURL=enggagement.router.js.map