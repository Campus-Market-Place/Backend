import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { sellerRequestSchema } from '../validation/auth.validation.js';
import { submitSellerRequest } from '../controllers/seller.controller.js';

export const sellerRouter = Router();

sellerRouter.post('/seller-request', authMiddleware, validateBody(sellerRequestSchema), submitSellerRequest);
