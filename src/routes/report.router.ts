import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateCategory, validateShop } from '../middleware/idvalidation.middleware.js';
import { requireActiveSeller } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { ReportSchema } from '../validation/report.validation.js';
import { createReport, getReportsforshop, handleAppeal, sendAppeal } from '../controllers/report.controller.js';
export const reportRouter = Router();



reportRouter.post('/:shopId', authMiddleware,validateShop(),validateBody(ReportSchema) ,createReport);
reportRouter.get('/:shopId',authMiddleware,requireActiveSeller() ,validateShop(), getReportsforshop);
reportRouter.post('/appeal/:shopId', authMiddleware ,sendAppeal);

// Admin
// handle appeal
reportRouter.post('/appeal/:id/handle', authMiddleware, handleAppeal);