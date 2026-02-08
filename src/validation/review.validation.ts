import { z } from 'zod';



export const ReviewSchema = z.object({
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comment: z.string().trim().optional(),
});