import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { catchAsync } from '../middleware/wrapper.js';
import { ConflictError, NotFoundError } from '../errors/apperror.js';
import { logger } from '../lib/logger.js';
import { Roles, SellerStatuses } from '../constants/auth.js';

export const submitSellerRequest = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError('User context missing');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { sellerProfile: true },
  });

  if (!user || user.deletedAt) {
    throw new NotFoundError('User not found');
  }

  if (user.role === Roles.SELLER || user.sellerStatus === SellerStatuses.APPROVED) {
    throw new ConflictError('User is already a seller');
  }

  const data = {
    shopName: req.body.shopName,
    campusLocation: req.body.campusLocation,
    categories: req.body.categories,
    mainPhone: req.body.mainPhone,
    secondaryPhone: req.body.secondaryPhone,
    idImage: req.body.idImage,
    agreedToRules: req.body.agreedToRules,
    deletedAt: null,
  };

  const sellerProfile = user.sellerProfile
    ? await prisma.sellerProfile.update({
        where: { id: user.sellerProfile.id },
        data,
      })
    : await prisma.sellerProfile.create({
        data: {
          ...data,
          userId: user.id,
        },
      });

  await prisma.user.update({
    where: { id: user.id },
    data: { sellerStatus: SellerStatuses.APPROVED },
  });

  logger.info({
    event: 'seller_request_submitted',
    requestId: req.requestId,
    userId: user.id,
    sellerProfileId: sellerProfile.id,
  });

  res.status(201).json({
    message: 'Seller request submitted',
    sellerStatus: SellerStatuses.APPROVED,
  });
});

// export const approveSellerRequest = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.params.userId;

//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     include: { sellerProfile: true },
//   });

//   if (!user || user.deletedAt) {
//     throw new NotFoundError('User not found');
//   }

//   if (user.sellerStatus !== SellerStatuses.PENDING) {
//     throw new ConflictError('Seller request is not pending');
//   }

//   await prisma.user.update({
//     where: { id: user.id },
//     data: {
//       role: Roles.SELLER,
//       sellerStatus: SellerStatuses.APPROVED,
//     },
//   });

//   if (user.sellerProfile) {
//     await prisma.sellerProfile.update({
//       where: { id: user.sellerProfile.id },
//       data: { approvedAt: new Date(), deletedAt: null },
//     });
//   }

//   logger.info({
//     event: 'seller_request_approved',
//     requestId: req.requestId,
//     userId: user.id,
//   });

//   res.status(200).json({
//     message: 'Seller request approved',
//     role: Roles.SELLER,
//     sellerStatus: SellerStatuses.APPROVED,
//   });
// });

export const rejectSellerRequest = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { sellerProfile: true },
  });

  if (!user || user.deletedAt) {
    throw new NotFoundError('User not found');
  }

//   if (user.sellerStatus !== SellerStatuses.PENDING) {
//     throw new ConflictError('Seller request is not pending');
//   }

  await prisma.user.update({
    where: { id: user.id },
    data: { sellerStatus: SellerStatuses.SUSPENDED },
  });

  if (user.sellerProfile) {
    await prisma.sellerProfile.update({
      where: { id: user.sellerProfile.id },
      data: { deletedAt: new Date() },
    });
  }

  logger.info({
    event: 'seller_request_rejected',
    requestId: req.requestId,
    userId: user.id,
  });

  res.status(200).json({
    message: 'Seller request rejected',
    sellerStatus: SellerStatuses.NONE,
  });
});
