// create a product
// update a product
// get a product for a category
// get a product for a shop
// get single product details
// delete a product

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { catchAsync } from '../middleware/wrapper.js';
import { ConflictError, NotFoundError } from '../errors/apperror.js';
import { logger } from '../lib/logger.js';
import { Roles, SellerStatuses } from '../constants/auth.js';

import { scoreImage } from "./image_detection.controller.js";
import { ImageStatus } from "../constants/image.js";
import { getUploadedFiles } from '../lib/uplode_file.js';




export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new NotFoundError("User context missing");

  const files = getUploadedFiles(req);

  if (files.length === 0) {
    throw new NotFoundError("No images uploaded");
  }

  const imagepaths = files.map((file) => file.path);

  const { name, description, price } = req.body;

  await prisma.$transaction(async (tx) => {

    const product = await tx.product.create({
      data: {
        name,
        description,
        price,
        isActive: false, // activate only after scoring
        status: "REVIEW", // default to REVIEW until images are scored
        shopId: req.shop,
        categoryId: req.category,
      },
    });

    // Create images as PENDING
    const imagesData = imagepaths.map((path: string) => ({
      productId: product.id,
      userId,
      imagePath: path,
      status: "PENDING" as ImageStatus,
      phash: "", // or null, depending on your schema
      score: 0, // or null, depending on your schema
    }));

    await tx.productImage.createMany({ data: imagesData });

    logger.info({
      event: 'product_created',
      requestId: req.requestId,
      productId: product.id,
      shopId: req.shop,
      categoryId: req.category,
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

      const allRejected = productImages.every((i) => i.status === "REJECTED");
      const anyReview = productImages.some((i) => i.status === "REVIEW");
      const allApproved = productImages.every((i) => i.status === "APPROVED");

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


// update a product
// get a product for a category
// get a product for a shop
// get single product details
// delete a product

// export const updateProduct = catchAsync(async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const { name, description, price, category, shop } = req.body;

//     const product = await prisma.product.update({
//         where: { id },
//         data: {
//             name,
//             description,
//             price,
//             categoryId: category,
//             shopId: shop,
//         },
//     });

//     if (!product) {
//         throw new NotFoundError('Product not found');           
//     })

// });

// get a product for a category
export const getProductsByCategory = catchAsync(async (req: Request, res: Response) => {
    let { id } = req.params;

    // Ensure id is a string
    if (Array.isArray(id)) {
        id = id[0];
    }
    if (!id || typeof id !== "string") {
        throw new NotFoundError("Invalid category id");
    }

    const products = await prisma.product.findMany({
        where: { categoryId: id, status: "APPROVED" },
        include: { images: true },
    });

    res.status(200).json(products);
    
});


// get a product for a shop
export const getProductsByShop = catchAsync(async (req: Request, res: Response) => {
    let { id } = req.params;

    // Ensure id is a string
    if (Array.isArray(id)) {
        id = id[0];
    }
    if (!id || typeof id !== "string") {
        throw new NotFoundError("Invalid shop id");
    }

    const products = await prisma.product.findMany({
        where: { shopId: id, status: "APPROVED" },
        include: { images: true },
    });

    res.status(200).json(products);
});

// get single product details
export const getProductDetails = catchAsync(async (req: Request, res: Response) => {
    let { id } = req.params;

    // Ensure id is a string
    if (Array.isArray(id)) {
        id = id[0];
    }
    if (!id || typeof id !== "string") {
        throw new NotFoundError("Invalid product id");
    }

    const product = await prisma.product.findUnique({
        where: { id },
        include: { images: true, shop: true, category: true },
    });

    if (!product || product.status !== "APPROVED") {
        throw new NotFoundError("Product not found");
    }

    res.status(200).json(product);
    
});

// delete a product
export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    let { id } = req.params;
    // Ensure id is a string
    if (Array.isArray(id)) {
        id = id[0];
    }
    if (!id || typeof id !== "string") {
        throw new NotFoundError("Invalid product id");
    }
    
    const product = await prisma.product.findUnique({
        where: { id },
    });

    if (!product) {
        throw new NotFoundError("Product not found");
    }
    
    await prisma.product.delete({
        where: { id },
    });
    res.status(200).json({ message: "Product deleted successfully" });
});