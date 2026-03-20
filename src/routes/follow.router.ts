import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateCategory, validateShop } from '../middleware/idvalidation.middleware.js';
import { getShopFollowers, toggleFollowShop } from '../controllers/follow.controller.js';
import { requireActiveSeller } from '../middleware/role.middleware.js';
import { requireShopOwner } from '../middleware/shopowner.middleware.js';
export const followRouter = Router();



followRouter.post('/:shopId', authMiddleware,validateShop(),requireShopOwner() ,toggleFollowShop);
followRouter.get('/:shopId',authMiddleware,requireActiveSeller(),validateShop(), getShopFollowers);