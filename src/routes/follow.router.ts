import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateCategory, validateShop } from '../middleware/idvalidation.middleware.js';
import { getShopFollowers, toggleFollowShop } from '../controllers/follow.controller.js';
import { requireActiveSeller } from '../middleware/role.middleware.js';
export const followRouter = Router();



followRouter.post('/:shopId', authMiddleware,validateShop(), toggleFollowShop);
followRouter.get('/:shopId',authMiddleware,requireActiveSeller(),validateShop(), getShopFollowers);