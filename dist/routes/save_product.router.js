"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveProductRouter = void 0;
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const idvalidation_middleware_js_1 = require("../middleware/idvalidation.middleware.js");
const save_product_controller_js_1 = require("../controllers/save_product.controller.js");
exports.saveProductRouter = (0, express_1.Router)();
exports.saveProductRouter.post('/', auth_middleware_js_1.authMiddleware, (0, idvalidation_middleware_js_1.validateShop)(), (0, idvalidation_middleware_js_1.validateProduct)(), save_product_controller_js_1.saveProduct);
exports.saveProductRouter.delete('/', auth_middleware_js_1.authMiddleware, (0, idvalidation_middleware_js_1.validateProduct)(), save_product_controller_js_1.unsaveProduct);
exports.saveProductRouter.get('/', auth_middleware_js_1.authMiddleware, save_product_controller_js_1.getSavedProducts);
//# sourceMappingURL=save_product.router.js.map