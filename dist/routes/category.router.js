"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = require("express");
const category_controller_js_1 = require("../controllers/category.controller.js");
exports.categoryRouter = (0, express_1.Router)();
exports.categoryRouter.post('/categories', category_controller_js_1.createcategory);
exports.categoryRouter.get('/categories', category_controller_js_1.getcategory);
exports.categoryRouter.delete('/categories/:id', category_controller_js_1.deletecategory);
//# sourceMappingURL=category.router.js.map