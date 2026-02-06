import { z } from 'zod';

export const CreateProductSchema = z.object({
    name: z.string().trim().min(2, 'Product name must be at least 2 characters'),
    description: z.string().trim().min(5, 'Product description must be at least 5 characters'),
    price: z.number().positive('Price must be a positive number'),
    isactive: z.boolean().default(true),
    images: z.array(z.string().trim().min(3, 'Image URL must be at least 3 characters')).min(1, 'At least one product image is required'),
});




