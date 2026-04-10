"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const idvalidation_middleware_js_1 = require("../middleware/idvalidation.middleware.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
const report_controller_js_1 = require("../controllers/report.controller.js");
const shopowner_middleware_js_1 = require("../middleware/shopowner.middleware.js");
exports.reportRouter = (0, express_1.Router)();
exports.reportRouter.post('/:shopId', auth_middleware_js_1.authMiddleware, (0, idvalidation_middleware_js_1.validateShop)(), (0, shopowner_middleware_js_1.requireShopOwner)(), report_controller_js_1.createReport);
exports.reportRouter.get('/:shopId', auth_middleware_js_1.authMiddleware, (0, role_middleware_js_1.requireActiveSeller)(), (0, idvalidation_middleware_js_1.validateShop)(), report_controller_js_1.getReportsforshop);
exports.reportRouter.post('/appeal/:shopId', auth_middleware_js_1.authMiddleware, report_controller_js_1.sendAppeal);
// Admin
// handle appeal
exports.reportRouter.post('/appeal/:id/handle', auth_middleware_js_1.authMiddleware, report_controller_js_1.handleAppeal);
//# sourceMappingURL=report.router.js.map