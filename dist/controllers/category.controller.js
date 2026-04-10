"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletecategory = exports.getcategory = exports.createcategory = void 0;
const prisma_js_1 = require("../lib/prisma.js");
const wrapper_js_1 = require("../middleware/wrapper.js");
const apperror_js_1 = require("../errors/apperror.js");
const logger_js_1 = require("../lib/logger.js");
// create a category
exports.createcategory = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        throw new apperror_js_1.ConflictError('Category name is required');
    }
    const category = await prisma_js_1.prisma.category.create({
        data: {
            name,
        },
    });
    logger_js_1.logger.info({
        event: 'category_created',
        requestId: req.requestId,
        categoryId: category.id,
    });
    res.status(201).json(category);
});
// get a catagory
exports.getcategory = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const categories = await prisma_js_1.prisma.category.findMany();
    res.status(200).json({ data: { categories } });
    logger_js_1.logger.info({
        event: 'categories_fetched',
        requestId: req.requestId,
    });
});
// delete a category
exports.deletecategory = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    let { id } = req.params;
    if (!id || Array.isArray(id)) {
        throw new apperror_js_1.ConflictError('Category id is required and must be a string');
    }
    const category = await prisma_js_1.prisma.category.findUnique({
        where: { id: id },
    });
    if (!category) {
        throw new apperror_js_1.NotFoundError('Category not found');
    }
    await prisma_js_1.prisma.category.delete({
        where: { id },
    });
    logger_js_1.logger.info({
        event: 'category_deleted',
        requestId: req.requestId,
        categoryId: id,
    });
    res.status(204).send();
});
//# sourceMappingURL=category.controller.js.map