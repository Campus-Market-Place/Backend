import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { getSellerProfile, submitSellerRequest, updateSellerProfile } from '../controllers/seller.controller.js';
import { sellerRequestSchema, sellerUpdateSchema } from '../validation/seller.validation.js';
import { uploadSellerImages, uploadupdateImages } from '../lib/uplode.js';
import { validateCategory } from '../middleware/idvalidation.middleware.js';
import { requireActiveSeller } from '../middleware/role.middleware.js';
export const sellerRouter = Router();

sellerRouter.post('/seller-request', uploadSellerImages, authMiddleware, validateCategory(), validateBody(sellerRequestSchema), submitSellerRequest);
sellerRouter.get('/seller-profile', authMiddleware, requireActiveSeller(), getSellerProfile);
sellerRouter.put('/seller-profile', uploadupdateImages, authMiddleware, requireActiveSeller(), validateBody(sellerUpdateSchema), updateSellerProfile);
