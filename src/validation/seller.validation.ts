import { z } from 'zod';

export const sellerRequestSchema = z.object({
    shopName: z.string().trim().min(2, 'shopName is required'),
    discription: z.string().trim().min(5, 'discription must be at least 5 characters'),
    campusLocation: z.string().trim(),
    mainPhone: z.string().trim().min(5, 'mainPhone is required'),
    secondaryPhone: z.string().trim().optional(),

    // agrreedToRules must be true ,input can be boolean or string '1'/ 0'
     agreedToRules: z.string().trim().refine(value => value === '1', {
        message: 'agreedToRules must be true',
    }), 
    // agreedToRules: z.boolean().refine(value => value === true, {
    //     message: 'agreedToRules must be true',
    // }), 
    // frontIdImage: z.string().trim().min(3, 'frontIdImage is required'),
    // backIdImage: z.string().trim().min(3, 'backIdImage is required'),
    instagram: z.string().trim().optional(),
    telegram: z.string().trim().optional(),
    tiktok: z.string().trim().optional(),
    other: z.union([
        z.array(z.string().trim().min(1)).min(1, 'other must have at least one item if provided'),
        z.string().trim().min(1, 'other must be a non-empty string if provided'),
    ]).optional(),
});

export const sellerUpdateSchema = z.object({
    shopName: z.string().trim().min(2, 'shopName must be at least 2 characters').optional(),
    discription: z.string().trim().min(5, 'discription must be at least 5 characters').optional(),
    campusLocation: z.string().trim().optional(),
    mainPhone: z.string().trim().min(5, 'mainPhone must be at least 5 characters').optional(),
    secondaryPhone: z.string().trim().optional(),
    categoryId: z.string().trim().optional(),
    agreedToRules: z.union([z.string().trim(), z.boolean()]).optional(),
    instagram: z.string().trim().optional(),
    telegram: z.string().trim().optional(),
    tiktok: z.string().trim().optional(),
    other: z.union([
        z.array(z.string().trim().min(1)).min(1, 'other must have at least one item if provided'),
        z.string().trim().min(1, 'other must be a non-empty string if provided'),
    ]).optional(),
});