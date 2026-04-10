"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.telegramLoginSchema = void 0;
const zod_1 = require("zod");
exports.telegramLoginSchema = zod_1.z.object({
    telegram_username: zod_1.z
        .string()
        .trim()
        .min(3, 'telegram_username must be at least 3 characters')
        .max(32, 'telegram_username must be at most 32 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'telegram_username can only contain letters, numbers, and underscores'),
    telegram_id: zod_1.z.string().trim().min(3, 'telegram_id must be at least 3 characters').max(32, 'telegram_id must be at most 32 characters'),
    telegram_chat_id: zod_1.z.string().trim().min(3, 'telegram_chat_id must be at least 3 characters').max(32, 'telegram_chat_id must be at most 32 characters'),
});
//# sourceMappingURL=auth.validation.js.map