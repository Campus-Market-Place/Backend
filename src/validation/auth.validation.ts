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




