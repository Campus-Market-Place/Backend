import { Router } from 'express';
import { createcategory, getcategory, deletecategory } from '../controllers/category.controller.js';

export const categoryRouter = Router();

categoryRouter.post('/categories', createcategory);
categoryRouter.get('/categories', getcategory);
categoryRouter.delete('/categories/:id', deletecategory);