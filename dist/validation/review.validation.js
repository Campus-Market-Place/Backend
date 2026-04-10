"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewSchema = void 0;
const zod_1 = require("zod");
exports.ReviewSchema = zod_1.z.object({
    rating: zod_1.z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comment: zod_1.z.string().trim().optional(),
});
//# sourceMappingURL=review.validation.js.map