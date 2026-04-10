"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopRouter = void 0;
const express_1 = require("express");
const shop_controller_js_1 = require("../controllers/shop.controller.js");
const idvalidation_middleware_js_1 = require("../middleware/idvalidation.middleware.js");
exports.shopRouter = (0, express_1.Router)();
exports.shopRouter.get('/:shopId', (0, idvalidation_middleware_js_1.validateShop)(), shop_controller_js_1.getShop);
//# sourceMappingURL=shop.router.js.map