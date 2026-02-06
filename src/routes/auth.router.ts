import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { telegramLoginSchema } from '../validation/auth.validation.js';

export const authRouter = Router();

authRouter.post('/login', validateBody(telegramLoginSchema), login);
