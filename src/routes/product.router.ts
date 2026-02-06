import { Router } from 'express';
import { createProduct } from '../controllers/product.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { CreateProductSchema } from '../validation/product.validation.js';

export const productRouter = Router();

productRouter.post('/products',validateBody(CreateProductSchema), createProduct);