import { Router } from 'express';
import { createProduct } from '../controllers/product.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { CreateProductSchema } from '../validation/product.validation.js';
import { requireSeller } from '../middleware/role.middleware.js';

export const productRouter = Router();

productRouter.post('/products',requireSeller,validateBody(CreateProductSchema), createProduct);