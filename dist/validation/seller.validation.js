"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerUpdateSchema = exports.sellerRequestSchema = void 0;
const zod_1 = require("zod");
exports.sellerRequestSchema = zod_1.z.object({
    shopName: zod_1.z.string().trim().min(2, 'shopName is required'),
    discription: zod_1.z.string().trim().min(5, 'discription must be at least 5 characters'),
    campusLocation: zod_1.z.string().trim(),
    mainPhone: zod_1.z.string().trim().min(5, 'mainPhone is required'),
    secondaryPhone: zod_1.z.string().trim().optional(),
    // agrreedToRules must be true ,input can be boolean or string '1'/ 0'
    agreedToRules: zod_1.z.string().trim().refine(value => value === '1', {
        message: 'agreedToRules must be true',
    }),
    // agreedToRules: z.boolean().refine(value => value === true, {
    //     message: 'agreedToRules must be true',
    // }), 
    // frontIdImage: z.string().trim().min(3, 'frontIdImage is required'),
    // backIdImage: z.string().trim().min(3, 'backIdImage is required'),
    instagram: zod_1.z.string().trim().optional(),
    telegram: zod_1.z.string().trim().optional(),
    tiktok: zod_1.z.string().trim().optional(),
    other: zod_1.z.union([
        zod_1.z.array(zod_1.z.string().trim().min(1)).min(1, 'other must have at least one item if provided'),
        zod_1.z.string().trim().min(1, 'other must be a non-empty string if provided'),
    ]).optional(),
});
exports.sellerUpdateSchema = zod_1.z.object({
    shopName: zod_1.z.string().trim().min(2, 'shopName must be at least 2 characters').optional(),
    discription: zod_1.z.string().trim().min(5, 'discription must be at least 5 characters').optional(),
    campusLocation: zod_1.z.string().trim().optional(),
    mainPhone: zod_1.z.string().trim().min(5, 'mainPhone must be at least 5 characters').optional(),
    secondaryPhone: zod_1.z.string().trim().optional(),
    categoryId: zod_1.z.string().trim().optional(),
    agreedToRules: zod_1.z.union([zod_1.z.string().trim(), zod_1.z.boolean()]).optional(),
    instagram: zod_1.z.string().trim().optional(),
    telegram: zod_1.z.string().trim().optional(),
    tiktok: zod_1.z.string().trim().optional(),
    other: zod_1.z.union([
        zod_1.z.array(zod_1.z.string().trim().min(1)).min(1, 'other must have at least one item if provided'),
        zod_1.z.string().trim().min(1, 'other must be a non-empty string if provided'),
    ]).optional(),
});
//# sourceMappingURL=seller.validation.js.map