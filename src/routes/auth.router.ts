import { Router } from 'express';
import { login, me, telegramLogin } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { telegramLoginSchema } from '../validation/auth.validation.js';

export const authRouter = Router();

authRouter.get('/me', me);
authRouter.post('/login', validateBody(telegramLoginSchema), login);
authRouter.post('/telegram', telegramLogin);
