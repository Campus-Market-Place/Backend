import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateProduct, validateShop } from '../middleware/idvalidation.middleware.js';
import { getSavedProducts, saveProduct, unsaveProduct } from '../controllers/save_product.controller.js';
export const saveProductRouter = Router();



saveProductRouter.post('/', authMiddleware, validateShop(), validateProduct(), saveProduct);
saveProductRouter.delete('/', authMiddleware, validateProduct(), unsaveProduct);
saveProductRouter.get('/', authMiddleware, getSavedProducts);

