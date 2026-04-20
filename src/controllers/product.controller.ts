// create a product
// update a product
// get a product for a category
// get a product for a shop
// get single product details
// delete a product

import { Request, Response } from 'express';
import type { Prisma, ProductImage } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { catchAsync } from '../middleware/wrapper.js';
import { ConflictError, NotFoundError } from '../errors/apperror.js';
import { logger } from '../lib/logger.js';
import { Roles, SellerStatuses } from '../constants/auth.js';

import { scoreImage } from "./image_detection.controller.js";
import { ImageStatus } from "../constants/image.js";
import { getUploadedFiles } from '../lib/uplode_file.js';
import { uploadImageBuffer, uploadMulterFiles } from "../lib/cloudinary_upload.js";
import { getShopFollowers } from './follow.controller.js';
import { sendTelegramMessage } from '../lib/Telegram_webhook.js';




export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new NotFoundError("User context missing");

  const shop = req.shop.id;
  const category = req.category;

  if (!shop || Array.isArray(shop)) {
    throw new ConflictError('Shop id is required and must be a string');
  }

  if (!category || Array.isArray(category)) {
    throw new ConflictError('Category id is required and must be a string');
  }

  console.log("Received product creation request:");
  console.log("User ID:", userId);
  console.log("Request Body:", req.body);
  console.log("Uploaded Files:", req.files);

  const files = getUploadedFiles(req);

  if (files.length === 0) {
    throw new NotFoundError("No images uploaded");
  }

  const uploads = await uploadMulterFiles(files, { folder: "products" });
  const imagepaths = uploads.map((upload) => upload.secure_url);

  const { name, description, price } = req.body;

  console.log("Extracted product details:");
  console.log("Name:", name);
  console.log("Description:", description);
  console.log("Price:", price);
  console.log("Image Paths:", imagepaths);

  // change string price to int 
  const priceInt = parseInt(price);

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {

    const product = await tx.product.create({
      data: {
        name,
        description,
        price: priceInt,
        isActive: false, // activate only after scoring
        status: "APPROVED", // default to REVIEW until images are scored
        shopId: shop,
        categoryId: category,
      },
    });

    // Create images as PENDING
    const imagesData = imagepaths.map((path: string) => ({
      productId: product.id,
      userId,
      imagePath: path,
      status: "APPROVED" as ImageStatus,
      phash: "", // or null, depending on your schema
      score: 0, // or null, depending on your schema
    }));

    await tx.productImage.createMany({ data: imagesData });

    return product;

  });

  // get shop
  // const shopDetails = await prisma.shop.findUnique({
  //   where: { id: shop },
  // })




  // const message = `📢 New product alert!\n\n🛍️ ${result.name} is now available in ${req.shop?.shopName || "our shop"}\n\n💰 Price: $${result.price}\n\n👀 Check it out before it's gone!`;

  // const telegramRecipients = followers
  //   .map((follower) => follower.user.telegramchatId)
  //   .filter((chatId): chatId is string => Boolean(chatId));

  // await Promise.allSettled(
  //   telegramRecipients.map((chatId) => sendTelegramMessage(chatId, message))
  // );



  logger.info({
    event: 'product_created',
    requestId: req.requestId,
    productId: result.id,
    shopId: shop,
    categoryId: category,
  });

  res.status(201).json({
    message: "Product created. Images will be verified shortly.",
    productId: result.id,
  });


});


// pseudo worker using setInterval / queue
// async function processPendingImages() {
//   const pendingImages = await prisma.productImage.findMany({
//     where: { status: "PENDING" },
//   });

//   for (const img of pendingImages) {
//     try {
//       const result = await scoreImage(img.imagePath, img.userId);

//       await prisma.productImage.update({
//         where: { id: img.id },
//         data: {
//           score: result.score,
//           status: result.status,
//           reasons: result.reasons,
//           cameraMake: result.make ?? null,
//           cameraModel: result.model ?? null,
//         },
//       });

//       // Update Product status based on images
//       const productImages: ProductImage[] = await prisma.productImage.findMany({
//         where: { productId: img.productId },
//       });

//       const allRejected = productImages.every((image) => image.status === "REJECTED");
//       const anyReview = productImages.some((image) => image.status === "REVIEW");
//       const allApproved = productImages.every((image) => image.status === "APPROVED");

//       type ProductStatus = "PENDING" | "REJECTED" | "REVIEW" | "APPROVED";
//       let newStatus: ProductStatus = "PENDING";
//       if (allRejected) newStatus = "REJECTED";
//       else if (anyReview) newStatus = "REVIEW";
//       else if (allApproved) newStatus = "APPROVED";

//       await prisma.product.update({
//         where: { id: img.productId },
//         data: { status: newStatus },
//       });

//       logger.info({
//         event: 'image_processed',
//         requestId: '', // No request context in worker
//         imageId: img.id,
//         productId: img.productId,
//         status: result.status,
//         score: result.score,
//       });

//     } catch (err) {
//       console.error("Image scoring failed:", img.id, err);
//     }
//   }
// }

// // Example: run every 5 seconds
// setInterval(processPendingImages, 5000);


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

// serach a product by name or description
export const searchProducts = catchAsync(async (req: Request, res: Response) => {
  // query as ?search= ",

  const { search } = req.query ;

    if (!search || typeof search !== "string") {
        throw new ConflictError("Search query is required and must be a string");
    }

    const products = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ],
            status: "APPROVED",
            isActive: true,
        },
        select: {
            id: true,
            name: true,
            price: true,
            categoryId: true,
            shopId: true,
            varified: true,
            status: true,
            ratingAverage: true,
            ratingCount: true,
            createdAt: true,
            images: {
                where: { status: "APPROVED" },
                select: { imagePath: true },
                take: 1, // Get only one approved image for preview
            },
        },
    });

    logger.info({
        event: 'product_search',  
        requestId: req.requestId,
        search,
        resultsCount: products.length,
    });

    res.status(200).json({ data: { products }, message: "Search results fetched successfully" });
});



// get a product for a seller 
export const getProductsByShop = catchAsync(async (req: Request, res: Response) => {
  const id = req.shop.id;
  let { page = "1", limit = "20" } = req.query;

  // Ensure id is a string
  if (!id || typeof id !== "string") {
    throw new NotFoundError("Invalid shop id");
  }

  const products = await prisma.product.findMany({
    where: { shopId: id, status: "APPROVED" },
    select: {
      id: true,
      name: true,
      price: true,
      categoryId: true,
      shopId: true,
      varified: true,
      isActive: true,
      status: true,
      ratingAverage: true,
      createdAt: true,
      images: {
        where: { status: "APPROVED" },
        select: { imagePath: true },
        take: 1, // Get only one approved image for preview
      },
    },
    skip: (parseInt(page as string) - 1) * parseInt(limit as string),
    take: parseInt(limit as string),
  });

  logger.info({
    event: 'products_by_shop_fetched',
    requestId: req.requestId,
    shopId: id,
    page,
    limit,
  });

  res.status(200).json({ data: { products }, message: "Products fetched successfully" });
});






// get a product for a category
export const getProductsByCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.category;
  let { page = "1", limit = "20" } = req.query;
  const pageNumber = Number.parseInt(page as string, 10);
  const limitNumber = Number.parseInt(limit as string, 10);

  // Ensure id is a string
  if (!id || typeof id !== "string") {
    throw new NotFoundError("Invalid category id");
  }

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    throw new ConflictError("page must be a positive integer");
  }

  if (!Number.isInteger(limitNumber) || limitNumber < 1) {
    throw new ConflictError("limit must be a positive integer");
  }


  const products = await prisma.product.findMany({
    where: {
      categoryId: id,
      status: "APPROVED",
      isActive: true,
      shop: {
        is: {
          status: { in: [SellerStatuses.APPROVED, SellerStatuses.WARNING] },
        },
      },
    },
    select: {
      id: true,
      name: true,
      price: true,
      categoryId: true,
      shopId: true,
      varified: true,
      status: true,
      ratingAverage: true,
      ratingCount: true,
      images: {
        where: { status: "APPROVED" },
        select: { imagePath: true },
        take: 1, // Get only one approved image for preview
      },
    },
    skip: (pageNumber - 1) * limitNumber,
    take: limitNumber,
  });



  logger.info({
    event: 'products_by_category_fetched',
    requestId: req.requestId,
    categoryId: id,
    page,
    limit,
  });


  res.status(200).json({ data: { products }, message: "Products fetched successfully" });

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
    // include: { images: true, shop: true, category: true },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      categoryId: true,
      shopId: true,
      varified: true,
      status: true,
      ratingAverage: true,
      ratingCount: true,

      reviews: {
        select: {
          user: {
            select: {
              username: true,
            },
          },
          comment: true,
          rating: true,
        },
        take: 2,
      },
      images: {
        where: { status: "APPROVED" },
        select: { imagePath: true },
      },
      shop: {
        select: {
          id: true,
          shopName: true,
          bio: true,
          rating: true,
          followersCount: true,
          status: true,
          seller: {
            select: {
              user: {
                select: {
                  username: true,
                  telegramId: true,
                },
              },
            },
          },
        },
      },

    }
  });


  if (product) {
    (product.shop as any).isFollowed = false;

    if (req.user?.id) {
      const follow = await prisma.follow.findUnique({
        where: {
          userId_shopId: {
            userId: req.user.id,
            shopId: product.shopId,
          },
        },
        select: {
          id: true,
        },
      });

      (product.shop as any).isFollowed = !!follow;
    }
  }

  if (!product || product.status !== "APPROVED") {
    throw new NotFoundError("Product not found");
  }

  logger.info({
    event: 'product_details_fetched',
    requestId: req.requestId,
    productId: id,

  })



  res.status(200).json({ data: { product }, message: "Product details fetched successfully" });

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

  await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.review.deleteMany({ where: { productId: id } });
    await tx.fevorite.deleteMany({ where: { productid: id } });
    await tx.product.delete({ where: { id } });
  });
  res.status(200).json({ message: "Product deleted successfully" });
});

// update product  
export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  let { id } = req.params;
  const { name, description, price, isActive, categoryId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new NotFoundError("User context missing");
  }

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

  const files = getUploadedFiles(req);

  if (categoryId !== undefined) {
    if (typeof categoryId !== "string" || !/^[0-9a-fA-F-]{36}$/.test(categoryId)) {
      throw new ConflictError("Invalid categoryId format");
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }
  }

  const data: Prisma.ProductUpdateInput = {};

  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (categoryId !== undefined) data.category = { connect: { id: categoryId } };
  if (isActive !== undefined) data.isActive = isActive;
  if (price !== undefined) {
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      throw new ConflictError("Price must be a positive number");
    }
    data.price = parsedPrice;
  }

  const shouldUpdateImages = files.length > 0;

  if (!Object.keys(data).length && !shouldUpdateImages) {
    throw new ConflictError("No updatable fields provided");
  }

  let uploadedImageUrls: string[] = [];

  if (shouldUpdateImages) {
    const uploads = await Promise.all(
      files.map((file) => uploadImageBuffer(file.buffer, { folder: "products" }))
    );
    uploadedImageUrls = uploads.map((upload) => upload.secure_url);
  }

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const updatedProduct = Object.keys(data).length
      ? await tx.product.update({
        where: { id },
        data,
      })
      : product;

    if (uploadedImageUrls.length) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({
        data: uploadedImageUrls.map((imagePath) => ({
          productId: id,
          userId,
          imagePath,
          status: "APPROVED" as ImageStatus,
          phash: "",
          score: 0,
        })),
      });
    }

    return updatedProduct;
  });

  logger.info({
    event: 'product_updated',
    requestId: req.requestId,
    productId: id,
  });

  res.status(200).json({ data: { product: result }, message: "Product updated successfully" });
});

// update product activness
export const updateProductActiveStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.product;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ConflictError("isActive must be a boolean");
  }



  // Ensure id is a string
  if (!id || typeof id !== "string") {
    throw new NotFoundError("Invalid product id");
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      name: true,
      price: true,
      shopId: true,
      shop: {
        select: {
          shopName: true,
        },
      },
    },
  });

  if (isActive) {
    const followers = await prisma.follow.findMany({
      where: { shopId: updatedProduct.shopId, isActive: true },
      select: {
        user: {
          select: {
            telegramchatId: true,
          },
        },
      },
    });

    const message = `📢 New product alert!\n\n🛍️ ${updatedProduct.name} is now available in ${updatedProduct.shop?.shopName || "our shop"}\n\n💰 Price: $${updatedProduct.price}\n\n👀 Check it out before it's gone!`;

    const telegramRecipients = followers
      .map((follower) => follower.user.telegramchatId)
      .filter((chatId): chatId is string => Boolean(chatId));

    await Promise.allSettled(
      telegramRecipients.map((chatId) => sendTelegramMessage(chatId, message))
    );
    
  }

  logger.info({
    event: 'product_active_status_updated',
    requestId: req.requestId,
    productId: id,
    isActive,
  });

  res.status(200).json({ message: "Product active status updated successfully" });
});