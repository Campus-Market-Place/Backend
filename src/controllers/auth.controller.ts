import { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
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
import express from "express";
import { verifyTelegram } from "../lib/verifyTelegram.js";
import jwt from "jsonwebtoken";
import { config } from '../config.js';

export const login = catchAsync(async (req: Request, res: Response) => {
  const telegram_id = req.body.telegram_id as string;
  const rawUsername = req.body.telegram_username as string;
  const rawTelegramChatId = req.body.telegram_chat_id as string;

  if (!telegram_id) throw new ForbiddenError('Telegram ID is required');
  if (!rawUsername) throw new ForbiddenError('Telegram username is required');
  if (!rawTelegramChatId) throw new ForbiddenError('Telegram chat ID is required');

  const username = rawUsername.trim().toLowerCase();
  const telegramChatId = rawTelegramChatId.trim();

  // 🔹 1. Find user WITH state
  let user = await prisma.user.findUnique({
    where: { telegramId: telegram_id },
    include: { userState: true },
  });

  // 🔴 If user exists but deleted
  if (user?.deletedAt) {
    throw new ForbiddenError('User is deactivated');
  }

  // 🔹 2. Create user if not exists
  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId: telegram_id,
        username,
        role: Roles.USER,
        telegramchatId: telegramChatId,
        userState: {
          create: {
            state: 'IDLE',
            context: {},
          },
        },
      },
      include: { userState: true },
    });

    logger.info({
      event: 'auth_signup',
      requestId: req.requestId,
      userId: user.id,
      username: user.username,
    });
  } else {
    // 🔹 3. Ensure UserState exists (VERY IMPORTANT for old users)
    if (!user.userState) {
      const state = await prisma.userState.create({
        data: {
          userId: user.id,
          state: 'IDLE',
          context: {},
        },
      });

      user.userState = state;
    }

    // 🔹 4. Update dynamic fields (keep user fresh)
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        telegramchatId: telegramChatId,
        updatedAt: new Date(),
      },
      include: { userState: true },
    });
  }

  // 🔹 5. Seller logic (clean separation)
  let sellerShop: string | null = null;

  if (user.role === Roles.SELLER ) {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      include: { shop: true },
    });

    if (sellerProfile?.shop) {
      sellerShop = sellerProfile.shop.id;
    }
  }

  // 🔹 6. Token
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
    telegramChatId: user.telegramchatId,
  });

  // 🔹 7. RETURN STATE (THIS IS CRITICAL FOR BOT)
  res.status(200).json({
    token,
    user: {
      id: user.id,
      telegram_id: user.telegramId,
      username: user.username,
      role: user.role,
      telegramChatId: user.telegramchatId,
      shopid: sellerShop,
      state: user.userState?.state,
      context: user.userState?.context,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

export const get_user_state = catchAsync(async (req: Request, res: Response) => {
  const user_id = req.query.user_id as string;

    if (!user_id) throw new ForbiddenError('User ID is required');

  // 🔹 1. Find user WITH state
  const user = await prisma.user.findUnique({
    where: { id: user_id },
    include: { userState: true },
  });


  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  res.status(200).json({
    state: user.userState?.state || 'IDLE',
    context: user.userState?.context || {},
  });
});



export const update_state = catchAsync(async (req: Request, res: Response) => {
  const user_id = req.query.user_id as string;
 
  // 🔹 1. Find user WITH state
  let user = await prisma.user.findUnique({
    where: { id: user_id },
    include: { userState: true },
  });
  
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  const { state, context } = req.body;

  if (!state) {
    throw new ForbiddenError('State is required');
  }

  const validStates = [
    'IDLE',
    'BROWSING',
    'SHOP_VIEW',
    'TIMEFRAME_SELECTION',
    'STAT_CHECK',
    'APPEALING',
    'APPEAL_SUMMITED',
    'SUPPORT_CONTACT',
    'SHOP_INFO',
    'TO_BE_SELLER'
  ];

  if (!validStates.includes(state)) {
    throw new ForbiddenError('Invalid state value');
  }

  await prisma.userState.upsert({
    where: { userId: user.id },
    update: { state, context },
    create: {
      userId: user.id,
      state,
      context,
    },
  });

  res.status(200).json({ message: 'User state updated successfully' });
});



// src/routes/auth.ts


export const telegramLogin = catchAsync(async (req: Request, res: Response) => {
  const { initData } = req.body;

  logger.info({
    event: 'telegram_login_attempt',
    requestId: req.requestId,
    initDataProvided: !!initData,
  });

  if (!initData || typeof initData !== "string") {
    return res.status(400).json({ error: "initData is required and must be a string" });
  }

  const BOT_TOKEN = config.Bot_token;

  const isValid = verifyTelegram(initData, BOT_TOKEN);

  if (!isValid) {
    return res.status(401).json({ error: "Invalid Telegram data" });
  }

  const params = new URLSearchParams(initData);
  const user = JSON.parse(params.get("user") || "{}");

  const userId = user.id;

  // TODO: find or create user in database
  let existingUser = await prisma.user.findUnique({
    where: { telegramId: userId.toString() },
  });

  if (!existingUser) {
    existingUser = await prisma.user.create({
      data: {
        telegramId: userId.toString(),
        username: user.username,
        role: Roles.USER,
        telegramchatId: userId.toString()
      },
    });
  }

  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user
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
    telegram_id: user.telegramId,
    telegram_chat_id: user.telegramchatId,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    sellerProfile,
  });
});
