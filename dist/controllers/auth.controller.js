"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.telegramLogin = exports.login = void 0;
const prisma_js_1 = require("../lib/prisma.js");
const jwt_js_1 = require("../lib/jwt.js");
const wrapper_js_1 = require("../middleware/wrapper.js");
const apperror_js_1 = require("../errors/apperror.js");
const logger_js_1 = require("../lib/logger.js");
const auth_js_1 = require("../constants/auth.js");
const verifyTelegram_js_1 = require("../lib/verifyTelegram.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = require("../config.js");
exports.login = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const telegram_id = req.body.telegram_id;
    const rawUsername = req.body.telegram_username;
    const rawTelegramChatId = req.body.telegram_chat_id;
    let sellerShop = null;
    if (!telegram_id) {
        throw new apperror_js_1.ForbiddenError('Telegram ID is required');
    }
    if (!rawUsername) {
        throw new apperror_js_1.ForbiddenError('Telegram username is required');
    }
    if (!rawTelegramChatId) {
        throw new apperror_js_1.ForbiddenError('Telegram chat ID is required');
    }
    const username = rawUsername.trim().toLowerCase();
    const telegramChatId = rawTelegramChatId;
    /*    typeof rawTelegramChatId === 'string' && rawTelegramChatId.trim().length > 0
         ? rawTelegramChatId.trim()
         : telegram_id; */
    let user = await prisma_js_1.prisma.user.findUnique({
        where: { telegramId: telegram_id },
    });
    if (user?.deletedAt) {
        throw new apperror_js_1.ForbiddenError('User is deactivated');
    }
    if (user && user.role === auth_js_1.Roles.SELLER) {
        sellerShop = await prisma_js_1.prisma.sellerProfile.findUnique({
            where: { userId: user.id },
            include: { shop: true },
        });
        if (!sellerShop) {
            throw new apperror_js_1.NotFoundError('Seller profile not found');
        }
        if (!sellerShop.shop) {
            throw new apperror_js_1.NotFoundError('Associated shop not found');
        }
    }
    if (!user) {
        user = await prisma_js_1.prisma.user.create({
            data: {
                telegramId: telegram_id,
                username,
                role: auth_js_1.Roles.USER,
                telegramchatId: telegramChatId
            },
        });
        logger_js_1.logger.info({
            event: 'auth_signup',
            requestId: req.requestId,
            userId: user.id,
            username: user.username,
        });
    }
    if (!user) {
        throw new apperror_js_1.NotFoundError('User could not be created');
    }
    const token = (0, jwt_js_1.signJwt)({
        sub: user.id,
        role: user.role,
        username: user.username,
    });
    logger_js_1.logger.info({
        event: 'auth_login',
        requestId: req.requestId,
        userId: user.id,
        username: user.username,
        telegramChatId: user.telegramchatId,
    });
    res.status(200).json({
        token,
        user: {
            id: user.id,
            telegram_id: user.telegramId,
            username: user.username,
            role: user.role,
            telegramChatId: user.telegramchatId,
            shopid: sellerShop?.shop?.id ?? null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
    });
});
// src/routes/auth.ts
exports.telegramLogin = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const { initData } = req.body;
    logger_js_1.logger.info({
        event: 'telegram_login_attempt',
        requestId: req.requestId,
        initDataProvided: !!initData,
    });
    if (!initData || typeof initData !== "string") {
        return res.status(400).json({ error: "initData is required and must be a string" });
    }
    const BOT_TOKEN = config_js_1.config.Bot_token;
    const isValid = (0, verifyTelegram_js_1.verifyTelegram)(initData, BOT_TOKEN);
    if (!isValid) {
        return res.status(401).json({ error: "Invalid Telegram data" });
    }
    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get("user") || "{}");
    const userId = user.id;
    // TODO: find or create user in database
    let existingUser = await prisma_js_1.prisma.user.findUnique({
        where: { telegramId: userId.toString() },
    });
    if (!existingUser) {
        existingUser = await prisma_js_1.prisma.user.create({
            data: {
                telegramId: userId.toString(),
                username: user.username,
                role: auth_js_1.Roles.USER,
                telegramchatId: userId.toString()
            },
        });
    }
    const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
        token,
        user
    });
});
exports.me = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new apperror_js_1.UnauthorizedError('User context missing');
    }
    const user = await prisma_js_1.prisma.user.findUnique({
        where: { id: req.user.id },
        include: { sellerProfile: true },
    });
    if (!user || user.deletedAt) {
        throw new apperror_js_1.NotFoundError('User not found');
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
//# sourceMappingURL=auth.controller.js.map