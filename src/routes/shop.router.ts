import { Router } from 'express';
import { getShop } from '../controllers/shop.controller.js';
import { validateShop } from '../middleware/idvalidation.middleware.js';
export const shopRouter = Router();



shopRouter.get('/:shopId',validateShop(), getShop );