// // create a product
// // update a product
// // get a product for a category
// // get a product for a shop
// // get single product details
// // delete a product

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { catchAsync } from '../middleware/wrapper.js';
import { ConflictError, NotFoundError } from '../errors/apperror.js';
import { logger } from '../lib/logger.js';
import { Roles, SellerStatuses } from '../constants/auth.js';
import multer from "multer";
import { scoreImage } from './image_detection.controller.js';

const upload = multer({ dest: "uploads/" });


export const createProduct = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new NotFoundError("User context missing");

    const { name, description, price, imagepaths } = req.body;


    await prisma.$transaction(async (tx) => {

        const product = await tx.product.create({
            data: {
                name,
                description,
                price,
                isActive: false, // activate only after scoring
                status: "PENDING",
                shopId: req.shop.id,
                categoryId: req.category.id,
            },
        });

        // Create images as PENDING
        const imagesData = imagepaths.map((path: string) => ({
            productId: product.id,
            userId,
            imagePath: path,
            status: "PENDING",
        }));

        await tx.productImage.createMany({ data: imagesData });



        logger.info({
            event: 'product_created',
            requestId: req.requestId,
            productId: product.id,
            shopId: req.shop.id,
            categoryId: req.category.id,
        });

        res.status(201).json({
            message: "Product created. Images will be verified shortly.",
            productId: product.id,
        });
    });

});





// pseudo worker using setInterval / queue
async function processPendingImages() {
    const pendingImages = await prisma.productImage.findMany({
        where: { status: "PENDING" },
    });

    for (const img of pendingImages) {
        try {
            const result = await scoreImage(img.imagePath, img.userId);

            await prisma.productImage.update({
                where: { id: img.id },
                data: {
                    score: result.score,
                    status: result.status,
                    reasons: result.reasons,
                    cameraMake: result.make ?? null,
                    cameraModel: result.model ?? null,

                },
            });

            // Update Product status based on images
            const productImages = await prisma.productImage.findMany({
                where: { productId: img.productId },
            });

            const allRejected = productImages.every(i => i.status === "REJECTED");
            const anyReview = productImages.some(i => i.status === "REVIEW");
            const allApproved = productImages.every(i => i.status === "APPROVED");

            type ProductStatus = "PENDING" | "REJECTED" | "REVIEW" | "APPROVED";
            let newStatus: ProductStatus = "PENDING";
            if (allRejected) newStatus = "REJECTED";
            else if (anyReview) newStatus = "REVIEW";
            else if (allApproved) newStatus = "APPROVED";

            await prisma.product.update({
                where: { id: img.productId },
                data: { status: newStatus },
            });

            logger.info({
                event: 'image_processed',
                requestId: '', // No request context in worker
                imageId: img.id,
                productId: img.productId,
                status: result.status,
                score: result.score,
            });

        } catch (err) {
            console.error("Image scoring failed:", img.id, err);
        }
    }
}

// Example: run every 5 seconds
setInterval(processPendingImages, 5000);

// export const createProduct = catchAsync(async (req: Request, res: Response) => {
//     const userId = req.user?.id;

//     if (!userId) {
//         throw new NotFoundError('User context missing');
//     }

//     let shop = req.shop;
//     let category = req.category;

//     const { name, description, price, isactive, imagepaths} = req.body;

//     // use transaction
//     await prisma.$transaction(async (tx) => {


//     imagepaths.forEach(async (path: string) => {
//         if (typeof path !== 'string' || !path.trim()) {
//             throw new ConflictError('Each image path must be a non-empty string');
//         }

//         const result = await scoreImage(path, userId);


//         await tx.productImage.create({
//             data: {
//                 productId: req.body.productId,
//                 userId: userId,
//                 imagePath: path,
//                 phash: result.hash,
//                 score: result.score,
//                 status: result.status,
//                 reasons: result.reasons,
//                 cameraMake: result.make ?? null,
//                 cameraModel: result.model ?? null,
//             },
//         });



//         if (result.status === "REJECTED") {
//             return res.status(400).json({
//                 message:
//                     "This image looks like it was taken from social media or is unclear. Please upload a camera photo or request manual review.",
//                 reasons: result.reasons,
//                 score: result.score,
//             });
//         }

//         if (result.status === "REVIEW") {
//             return res.status(200).json({
//                 message:
//                     "This image looks like it might be from social media or is unclear. It has been flagged for manual review, but you can proceed with listing the product.",
//                 reasons: result.reasons,
//                 score: result.score,
//             });
//         }



//     const product = await tx.product.create({
//         data: {
//             name,
//             description,
//             price,
//             isActive: isactive,
//             shopId: shop.id,
//             categoryId: category.id,
//         },
//     });

//     logger.info({
//         event: 'product_created',
//         requestId: req.requestId,
//         productId: product.id,
//         shopId: shop.id,
//         categoryId: category.id,
//     });

//     res.status(201).json(product);

// }) });

// // varify image 


