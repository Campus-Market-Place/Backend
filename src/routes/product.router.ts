import { Router } from 'express';
import { createProduct, deleteProduct, getProductDetails, getProductsByCategory, getProductsByShop, searchProducts, updateProduct, updateProductActiveStatus } from '../controllers/product.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { CreateProductSchema } from '../validation/product.validation.js';
import { requireActiveSeller } from '../middleware/role.middleware.js';

import { validateCategory, validateProduct, validateShop } from '../middleware/idvalidation.middleware.js';
import { uploadImages } from '../lib/uplode.js';
import { authMiddleware } from '../middleware/auth.middleware.js';



export const productRouter = Router();



// requireActiveSeller

productRouter.get('/products/search', searchProducts);
productRouter.post('/products/:shopId', authMiddleware, requireActiveSeller(), uploadImages, validateCategory(), validateShop(), validateBody(CreateProductSchema), createProduct);
productRouter.get('/products/:categoryId', validateCategory(), getProductsByCategory);
productRouter.get('/products/shop/:shopId', authMiddleware, requireActiveSeller(), validateShop(), getProductsByShop);
productRouter.get('/products/details/:id', getProductDetails);
productRouter.delete('/products/:id', authMiddleware, requireActiveSeller(), deleteProduct);
// productRouter.put('/products/:id', authMiddleware, requireActiveSeller(), validateProduct(), validateBody(CreateProductSchema), updateProduct);
productRouter.put('/products/:productId', authMiddleware, requireActiveSeller(), validateProduct(), updateProductActiveStatus);