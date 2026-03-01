import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateShop } from '../middleware/idvalidation.middleware.js';
import { contactClick, socialMediaClick, view } from '../controllers/enggagement.controller.js';
import { getShopStatistics } from '../controllers/statstics.controller.js';
import { requireActiveSeller } from '../middleware/role.middleware.js';

export const enggagementRouter = Router();

enggagementRouter.post('/:shopId/view', authMiddleware, validateShop(), view);
enggagementRouter.post('/:shopId/social-media-click', authMiddleware, validateShop(), socialMediaClick);
enggagementRouter.post('/:shopId/contact-click', authMiddleware, validateShop(), contactClick);
enggagementRouter.get('/:shopId/statistics', authMiddleware, requireActiveSeller(), validateShop(), getShopStatistics);
