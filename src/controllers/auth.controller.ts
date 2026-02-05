import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { signJwt } from '../lib/jwt.js';
import { catchAsync } from '../middleware/wrapper.js';
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/apperror.js';
import { logger } from '../lib/logger.js';
import { Roles, SellerStatuses } from '../constants/auth.js';

export const login = catchAsync(async (req: Request, res: Response) => {
  const telegram_id = req.body.telegram_id as string;
  const rawUsername = req.body.telegram_username as string;
  const username = rawUsername.trim().toLowerCase();

  let user = await prisma.user.findUnique({
    where: { telegramId: telegram_id },
  });

  if (user?.deletedAt) {
    throw new ForbiddenError('User is deactivated');
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId: telegram_id,
        username,
        role: Roles.USER,
        sellerStatus: SellerStatuses.NONE,
      },
    });

    logger.info({
      event: 'auth_signup',
      requestId: req.requestId,
      userId: user.id,
      username: user.username,
    });
  }

  if (!user) {
    throw new NotFoundError('User could not be created');
  }

  const token = signJwt({
    sub: user.id,
    role: user.role,
    username: user.username,
  });

  logger.info({
    event: 'auth_login',
    requestId: req.requestId,
    userId: user.id,
    username: user.username,
  });

  res.status(200).json({
    token,
    user: {
      id: user.id,
      telegram_id : user.telegramId,
      username: user.username,
      role: user.role,
      sellerStatus: user.sellerStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

export const me = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('User context missing');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { sellerProfile: true },
  });

  if (!user || user.deletedAt) {
    throw new NotFoundError('User not found');
  }

  const sellerProfile = user.sellerProfile && !user.sellerProfile.deletedAt
    ? user.sellerProfile
    : null;

  res.status(200).json({
    id: user.id,
    telegram_id : user.telegramId,
    username: user.username,
    role: user.role,
    sellerStatus: user.sellerStatus,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    sellerProfile,
  });
});
