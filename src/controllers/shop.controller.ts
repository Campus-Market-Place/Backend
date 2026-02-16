// getshop from product
import { Request, Response } from 'express';
import { catchAsync } from '../middleware/wrapper.js';
import { prisma } from '../lib/prisma.js';
import { NotFoundError } from '../errors/apperror.js';
import { logger } from '../lib/logger.js';

// get shop details for a product
export const getShop = catchAsync(async (req: Request, res: Response) => {
    const id  = req.shop.id;

    // Ensure id is a string

    if (!id || typeof id !== "string") {
        throw new NotFoundError("Invalid shop id");
    }



    const shop = await prisma.shop.findUnique({
        where: { id , status: 'APPROVED' },
        select: {
            id: true,
            shopName: true,
            bio: true,
            rating: true,
            isOpen: true,
            status: true,
            followersCount: true,
            profileImageUrl: true,
            products: {
                where: { status: "APPROVED", isActive: true },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    categoryId: true,
                    varified: true,
                    status: true,
                    ratingAverage: true,
                    images: {
                        where: { status: "APPROVED" },
                        select: { imagePath: true },
                        take: 1, // Get only one approved image for preview
                    },
                },
            },
            seller: {
                select: {
                    user: {
                        select: {
                            username: true,
                            telegramId: true,
                        },
                    },
                    instagram: true || null,
                    telegram: true || null,
                    tiktok: true || null,
                    other: true || null,
                    mainPhone: true,
                    secondaryPhone: true || null,
                },
            },
        },

    });


    if (!shop) {
        throw new NotFoundError("Shop not found");
    }

    logger.info({
        event: 'shop_details_fetched',
        requestId: req.requestId,   

        shopId: id,
    });


    res.status(200).json({ data: { shop }, message: "Shop details fetched successfully" });

});