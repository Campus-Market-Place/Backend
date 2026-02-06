// getshop from product
import { Request, Response } from 'express';
import { catchAsync } from '../middleware/wrapper.js';
import { prisma } from '../lib/prisma.js';
import { NotFoundError } from '../errors/apperror.js';

// get shop details for a product
export const getShop = catchAsync(async (req: Request, res: Response) => {
    let { id } = req.params;
    
    // Ensure id is a string
    if (Array.isArray(id)) {
        id = id[0];
    }
    if (!id || typeof id !== "string") {
        throw new NotFoundError("Invalid shop id");
    }

    const shop = await prisma.shop.findUnique({
        where: { id },
    });

    if (!shop) {
        throw new NotFoundError("Shop not found");
    }

    res.status(200).json(shop);
});