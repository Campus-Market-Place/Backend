import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateProduct, validateShop } from '../middleware/idvalidation.middleware.js';
import { requireActiveSeller } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { ReviewSchema } from '../validation/review.validation.js';
import { createReview, getReviewsByProduct, getReviewsByshop } from '../controllers/review.controller.js';
export const reviewRouter = Router();



reviewRouter.post('/:shopId/:productId', authMiddleware,validateShop(),validateProduct(),validateBody(ReviewSchema) ,createReview);
reviewRouter.get('/:productId',authMiddleware ,validateProduct(), getReviewsByProduct);
reviewRouter.get('/:shopId',authMiddleware,requireActiveSeller() ,validateShop(), getReviewsByshop);