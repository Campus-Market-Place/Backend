"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductSchema = exports.CreateProductSchema = void 0;
const zod_1 = require("zod");
exports.CreateProductSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Product name must be at least 2 characters'),
    description: zod_1.z.string().trim().min(5, 'Product description must be at least 5 characters'),
    price: zod_1.z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Price must be a positive number',
    }),
    isactive: zod_1.z.boolean().default(false).optional(),
});
exports.UpdateProductSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Product name must be at least 2 characters').optional(),
    description: zod_1.z.string().trim().min(5, 'Product description must be at least 5 characters').optional(),
    price: zod_1.z.union([
        zod_1.z.string().trim().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: 'Price must be a positive number',
        }),
        zod_1.z.number().positive('Price must be a positive number'),
    ]).optional(),
    categoryId: zod_1.z.string().trim().optional(),
    isActive: zod_1.z.union([
        zod_1.z.boolean(),
        zod_1.z.string().trim().refine((value) => value === 'true' || value === 'false', {
            message: 'isActive must be true or false',
        }).transform((value) => value === 'true'),
    ]).optional(),
});
//# sourceMappingURL=product.validation.js.map