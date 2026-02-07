import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { getSellerProfile, submitSellerRequest } from '../controllers/seller.controller.js';
import { sellerRequestSchema } from '../validation/seller.validation.js';
import multer from 'multer'
import { validateCategory } from '../middleware/idvalidation.middleware.js';
export const sellerRouter = Router();

const upload = multer({ dest: 'uploads/' });

sellerRouter.post('/seller-request',upload.array("image", 2), authMiddleware,validateCategory(), validateBody(sellerRequestSchema), submitSellerRequest);
sellerRouter.get('/seller-profile', authMiddleware, getSellerProfile );
