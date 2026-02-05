import { Router } from 'express';
import { me } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const userRouter = Router();

userRouter.get('/me', authMiddleware, me);
