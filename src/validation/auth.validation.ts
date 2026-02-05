import { z } from 'zod';


export const telegramLoginSchema = z.object({
  telegram_username: z
    .string()
    .trim()
    .min(3, 'telegram_username must be at least 3 characters')
    .max(32, 'telegram_username must be at most 32 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'telegram_username can only contain letters, numbers, and underscores'),
   telegram_id: z.string().trim().min(3, 'telegram_id must be at least 3 characters').max(32, 'telegram_id must be at most 32 characters'),

  });

export const sellerRequestSchema = z.object({
  shopName: z.string().trim().min(2, 'shopName is required'),
  campusLocation: z.string().trim().optional(),
  categories: z.array(z.string().trim().min(1)).min(1, 'categories must have at least one item'),
  mainPhone: z.string().trim().min(5, 'mainPhone is required'),
  secondaryPhone: z.string().trim().optional(),
  idImage: z.string().trim().min(3, 'idImage is required'),
  agreedToRules: z.literal(true, {
    message: 'agreedToRules must be true',
  }),
});


