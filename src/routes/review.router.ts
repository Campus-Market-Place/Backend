import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateProduct, validateShop } from '../middleware/idvalidation.middleware.js';
import { requireActiveSeller } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { ReviewSchema } from '../validation/review.validation.js';
import { createReview, getReviewsByProduct, getReviewsByshop } from '../controllers/review.controller.js';
export const reportRouter = Router();



reportRouter.post('/:shopId/:productId', authMiddleware,validateShop(),validateProduct(),validateBody(ReviewSchema) ,createReview);
reportRouter.get('/:productId' ,validateProduct(), getReviewsByProduct);
reportRouter.get('/:shopId',requireActiveSeller ,validateShop(), getReviewsByshop);
