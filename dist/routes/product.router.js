"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = require("express");
const product_controller_js_1 = require("../controllers/product.controller.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const product_validation_js_1 = require("../validation/product.validation.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
const idvalidation_middleware_js_1 = require("../middleware/idvalidation.middleware.js");
const uplode_js_1 = require("../lib/uplode.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
exports.productRouter = (0, express_1.Router)();
// requireActiveSeller
exports.productRouter.get('/products/search', product_controller_js_1.searchProducts);
exports.productRouter.post('/products/:shopId', auth_middleware_js_1.authMiddleware, (0, role_middleware_js_1.requireActiveSeller)(), uplode_js_1.uploadImages, (0, idvalidation_middleware_js_1.validateCategory)(), (0, idvalidation_middleware_js_1.validateShop)(), (0, validate_middleware_js_1.validateBody)(product_validation_js_1.CreateProductSchema), product_controller_js_1.createProduct);
exports.productRouter.get('/products/:categoryId', (0, idvalidation_middleware_js_1.validateCategory)(), product_controller_js_1.getProductsByCategory);
exports.productRouter.get('/products/shop/:shopId', auth_middleware_js_1.authMiddleware, (0, role_middleware_js_1.requireActiveSeller)(), (0, idvalidation_middleware_js_1.validateShop)(), product_controller_js_1.getProductsByShop);
exports.productRouter.get('/products/details/:id', product_controller_js_1.getProductDetails);
exports.productRouter.delete('/products/:id', auth_middleware_js_1.authMiddleware, (0, role_middleware_js_1.requireActiveSeller)(), product_controller_js_1.deleteProduct);
exports.productRouter.put('/products/:id', auth_middleware_js_1.authMiddleware, (0, role_middleware_js_1.requireActiveSeller)(), uplode_js_1.uploadImages, (0, validate_middleware_js_1.validateBody)(product_validation_js_1.UpdateProductSchema), product_controller_js_1.updateProduct);
exports.productRouter.put('/products/:productId/active-status', auth_middleware_js_1.authMiddleware, (0, role_middleware_js_1.requireActiveSeller)(), (0, idvalidation_middleware_js_1.validateProduct)(), product_controller_js_1.updateProductActiveStatus);
//# sourceMappingURL=product.router.js.map