import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { catchAsync } from '../middleware/wrapper.js';
import { ConflictError, NotFoundError } from '../errors/apperror.js';
import { logger } from '../lib/logger.js';
import { Roles, SellerStatuses } from '../constants/auth.js';



// create a category
export const createcategory = catchAsync(
    async (req: Request, res: Response) => {
        const { name } = req.body;

        if (!name) {
            throw new ConflictError('Category name is required');
        }

        const category = await prisma.category.create({
            data: {
                name,
            },
        });

        logger.info({
            event: 'category_created',
            requestId: req.requestId,
            categoryId: category.id,
        });

        res.status(201).json(category);
    }

)

// get a catagory
export const getcategory = catchAsync(
    async (req: Request, res: Response) => {
        await prisma.category.findMany().then((categories) => {
            res.status(200).json(categories);
        });

        logger.info({
            event: 'categories_fetched',
            requestId: req.requestId,
        });
        
    }
)

// delete a category
export const deletecategory = catchAsync(
    async (req: Request, res: Response) => {
        let { id } = req.params;

        if (!id || Array.isArray(id)) {
            throw new ConflictError('Category id is required and must be a string');
        }

        const category = await prisma.category.findUnique({
            where: { id: id },
        });

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        await prisma.category.delete({
            where: { id },
        });

        logger.info({
            event: 'category_deleted',
            requestId: req.requestId,
            categoryId: id,
        });

        res.status(204).send();
    }
)

