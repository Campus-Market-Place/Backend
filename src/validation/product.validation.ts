import { z } from 'zod';

export const CreateProductSchema = z.object({
    name: z.string().trim().min(2, 'Product name must be at least 2 characters'),
    description: z.string().trim().min(5, 'Product description must be at least 5 characters'),
    price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Price must be a positive number',
    }),
    isactive: z.boolean().default(false).optional(),
    
});




