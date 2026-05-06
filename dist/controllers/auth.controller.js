"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.telegramLogin = exports.update_state = exports.get_user_state = exports.login = void 0;
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
    if (!telegram_id)
        throw new apperror_js_1.ForbiddenError('Telegram ID is required');
    if (!rawUsername)
        throw new apperror_js_1.ForbiddenError('Telegram username is required');
    if (!rawTelegramChatId)
        throw new apperror_js_1.ForbiddenError('Telegram chat ID is required');
    const username = rawUsername.trim().toLowerCase();
    const telegramChatId = rawTelegramChatId.trim();
    // 🔹 1. Find user WITH state
    let user = await prisma_js_1.prisma.user.findUnique({
        where: { telegramId: telegram_id },
        include: { userState: true },
    });
    // 🔴 If user exists but deleted
    if (user?.deletedAt) {
        throw new apperror_js_1.ForbiddenError('User is deactivated');
    }
    // 🔹 2. Create user if not exists
    if (!user) {
        user = await prisma_js_1.prisma.user.create({
            data: {
                telegramId: telegram_id,
                username,
                role: auth_js_1.Roles.USER,
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
        logger_js_1.logger.info({
            event: 'auth_signup',
            requestId: req.requestId,
            userId: user.id,
            username: user.username,
        });
    }
    else {
        // 🔹 3. Ensure UserState exists (VERY IMPORTANT for old users)
        if (!user.userState) {
            const state = await prisma_js_1.prisma.userState.create({
                data: {
                    userId: user.id,
                    state: 'IDLE',
                    context: {},
                },
            });
            user.userState = state;
        }
        // 🔹 4. Update dynamic fields (keep user fresh)
        user = await prisma_js_1.prisma.user.update({
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
    let sellerShop = null;
    if (user.role === auth_js_1.Roles.SELLER) {
        const sellerProfile = await prisma_js_1.prisma.sellerProfile.findUnique({
            where: { userId: user.id },
            include: { shop: true },
        });
        if (sellerProfile?.shop) {
            sellerShop = sellerProfile.shop.id;
        }
    }
    // 🔹 6. Token
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
exports.get_user_state = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const user_id = req.query.user_id;
    if (!user_id)
        throw new apperror_js_1.ForbiddenError('User ID is required');
    // 🔹 1. Find user WITH state
    const user = await prisma_js_1.prisma.user.findUnique({
        where: { id: user_id },
        include: { userState: true },
    });
    if (!user) {
        throw new apperror_js_1.UnauthorizedError('User not found');
    }
    res.status(200).json({
        state: user.userState?.state || 'IDLE',
        context: user.userState?.context || {},
    });
});
exports.update_state = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const user_id = req.params.userId;
    // 🔹 1. Find user WITH state
    let user = await prisma_js_1.prisma.user.findUnique({
        where: { id: user_id },
        include: { userState: true },
    });
    if (!user) {
        throw new apperror_js_1.UnauthorizedError('User not found');
    }
    const { state, context } = req.body;
    if (!state) {
        throw new apperror_js_1.ForbiddenError('State is required');
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
        throw new apperror_js_1.ForbiddenError('Invalid state value');
    }
    await prisma_js_1.prisma.userState.upsert({
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