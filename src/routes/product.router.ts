import { Router } from 'express';
import { createProduct, deleteProduct, getProductDetails, getProductsByCategory } from '../controllers/product.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { CreateProductSchema } from '../validation/product.validation.js';
import { requireActiveSeller } from '../middleware/role.middleware.js';
import multer from 'multer'
import { validateCategory } from '../middleware/idvalidation.middleware.js';

const upload = multer({ dest: 'uploads/' });

export const productRouter = Router();


// i just want to uplode max 5  min 1 image
    
const uploadImages = upload.array('images', 5);

productRouter.post('/products', uploadImages, requireActiveSeller, validateBody(CreateProductSchema), createProduct);
productRouter.get('/products/:categoryId',validateCategory() ,getProductsByCategory);
productRouter.get('/products/details/:id', getProductDetails);
productRouter.delete('/products/:id',requireActiveSeller, deleteProduct);