import { NextFunction, Request, Response } from 'express';
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from '../errors/apperror.js';
import { config } from '../config.js';
import { prisma } from '../lib/prisma.js';

export const validateShop = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {



    const shopId =
      req.body?.shopId ??
      req.params?.shopId;

    console.log("Validating shop with ID:", shopId);

    if (!shopId || Array.isArray(shopId)) {
      throw new ConflictError('shop id is required and must be a string');
    }

    const shop = await prisma.shop.findUnique({
      where: { id: shopId, status: "APPROVED" }
    });

    console.log("Shop found in validation middleware:", shop);

    if (!shop) {
      throw new NotFoundError('Shop not found');
    }

    req.shop = shop;

    next();
  };
}

// validate category
export const validateCategory = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {

    const categoryId =
      req.body?.categoryId ??
      req.params?.categoryId;

    // 1️⃣ Validate presence & type
    if (!categoryId || typeof categoryId !== 'string') {
      throw new ConflictError('categoryId is required and must be a string');
    }

    // 2️⃣ (Optional but recommended) UUID format check
    if (!/^[0-9a-fA-F-]{36}$/.test(categoryId)) {
      throw new ConflictError('Invalid categoryId format');
    }

    // 3️⃣ Query Prisma correctly
    const category = await prisma.category.findUnique({
      where: { id: categoryId }, // ✅ STRING ONLY
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // 4️⃣ Attach clean value to request
    req.category = category.id;

    next();
  };
};

// export const validateCategory = () => {
//   return async (req: Request, _res: Response, next: NextFunction) => {

//     const categoryId = req.body;


//     if (!categoryId || Array.isArray(categoryId)) {
//             throw new ConflictError('category id is required and must be a string');
//         }

//      const category =await prisma.category.findUnique({
//         where : {id : categoryId}
//     });

//     if (!category) {
//         throw new NotFoundError('Category not found'); 
//     }

//     req.category = category.id;

//     next();
//   };
// }


export const validateProduct = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {

    const  productId  = req.body?.productId ?? req.params?.productId ?? req.query?.productId;

    console.log("Validating product with ID:", productId);


    if (!productId || Array.isArray(productId)) {
      throw new ConflictError('product id is required and must be a string');
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    console.log("Product found in validation middleware:", product);

    req.product = product.id;

    next();
  };
}