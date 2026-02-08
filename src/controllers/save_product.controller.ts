import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { catchAsync } from "../middleware/wrapper.js";
import { NotFoundError, ConflictError } from "../errors/apperror.js";
import { logger } from "../lib/logger.js";


export const saveProduct = catchAsync(async (req: Request, res: Response) => {

    const productId = req.product;
    const shopId = req.shop?.id;

    if (!productId || Array.isArray(productId)) {
        throw new ConflictError('Product id is required and must be a string');
    }

    if (!shopId || Array.isArray(shopId)) {
        throw new ConflictError('Shop id is required and must be a string');
    }

    const userId = req.user?.id;

    if (!userId) throw new NotFoundError("User context missing");

    await prisma.fevorite.create({
        data: {
            userid: userId,
            productid: productId,
        },
    })

    logger.info({
        event: 'product_saved',
        requestId: req.requestId,
        userId,
        productId,
    });

    res.status(200).json({ message: "Product saved successfully" });
})


// get saved products
export const getSavedProducts = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) throw new NotFoundError("User context missing");

    const savedProducts = await prisma.fevorite.findMany({
        where: { userid: userId },
        select: {
            product: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    ratingAverage: true,
                    ratingCount: true,
                    shop: {
                        select: {
                            status: true,
                            isOpen: true
                        }
                    },
                    images: {
                        select: {
                            imagePath: true,
                        },
                        take: 1,
                    },
                },

            }
        }
    })


    logger.info({
        event: 'saved_products_fetched',
        requestId: req.requestId,
        userId,
    });

    res.status(200).json({ data: savedProducts.map((item) => item.product) });
})