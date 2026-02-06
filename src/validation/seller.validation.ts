import { z } from 'zod';

export const sellerRequestSchema = z.object({
    shopName: z.string().trim().min(2, 'shopName is required'),
    discription: z.string().trim().min(5, 'discription must be at least 5 characters'),
    campusLocation: z.string().trim(),
    categories: z.array(z.string().trim().min(1)).min(1, 'categories must have at least one item'),
    mainPhone: z.string().trim().min(5, 'mainPhone is required'),
    secondaryPhone: z.string().trim().optional(),
    agreedToRules: z.boolean().refine(value => value === true, {
        message: 'agreedToRules must be true',
    }),
    frontIdImage: z.string().trim().min(3, 'frontIdImage is required'),
    backIdImage: z.string().trim().min(3, 'backIdImage is required'),
    instagram: z.string().trim().optional(),
    telegram: z.string().trim().optional(),
    tiktok: z.string().trim().optional(),
    other: z.union([
        z.array(z.string().trim().min(1)).min(1, 'other must have at least one item if provided'),
        z.string().trim().min(1, 'other must be a non-empty string if provided'),
    ]).optional(),
});