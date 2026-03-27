import { z } from 'zod';

export const CreateProductSchema = z.object({
    name: z.string().trim().min(2, 'Product name must be at least 2 characters'),
    description: z.string().trim().min(5, 'Product description must be at least 5 characters'),
    price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Price must be a positive number',
    }),
    isactive: z.boolean().default(false).optional(),
    
});

export const UpdateProductSchema = z.object({
    name: z.string().trim().min(2, 'Product name must be at least 2 characters').optional(),
    description: z.string().trim().min(5, 'Product description must be at least 5 characters').optional(),
    price: z.union([
        z.string().trim().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: 'Price must be a positive number',
        }),
        z.number().positive('Price must be a positive number'),
    ]).optional(),
    categoryId: z.string().trim().optional(),
    isActive: z.union([
        z.boolean(),
        z.string().trim().refine((value) => value === 'true' || value === 'false', {
            message: 'isActive must be true or false',
        }).transform((value) => value === 'true'),
    ]).optional(),
});




