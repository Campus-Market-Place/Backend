"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllReports = exports.handleAppeal = exports.getAllAppeals = exports.sendAppeal = exports.getReportsforshop = exports.createReport = void 0;
const prisma_js_1 = require("../lib/prisma.js");
const wrapper_js_1 = require("../middleware/wrapper.js");
const apperror_js_1 = require("../errors/apperror.js");
const logger_js_1 = require("../lib/logger.js");
const Telegram_webhook_js_1 = require("../lib/Telegram_webhook.js");
exports.createReport = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const shopId = req.shop?.id;
    const userId = req.user?.id;
    const { reason } = req.body;
    if (!shopId || Array.isArray(shopId)) {
        throw new apperror_js_1.ConflictError("Shop id is required and must be a string");
    }
    if (!userId) {
        throw new apperror_js_1.NotFoundError("User context missing");
    }
    // Check duplicate report first
    const existingReport = await prisma_js_1.prisma.report.findFirst({
        where: { reporterId: userId, shopId },
    });
    if (existingReport) {
        throw new apperror_js_1.ConflictError("You have already reported this shop");
    }
    // 🔥 Use transaction to prevent race condition
    const result = await prisma_js_1.prisma.$transaction(async (tx) => {
        // Create report
        const report = await tx.report.create({
            data: {
                shopId,
                reporterId: userId,
                reason,
            },
        });
        // Increment reports count safely
        const updatedShop = await tx.shop.update({
            where: { id: shopId },
            data: {
                reportsCount: { increment: 1 },
            },
            select: {
                id: true,
                reportsCount: true,
                status: true,
                seller: {
                    select: {
                        user: {
                            select: {
                                telegramchatId: true,
                            },
                        },
                    },
                },
            },
        });
        let newStatus = updatedShop.status;
        if (updatedShop.reportsCount === 2) {
            newStatus = "WARNING";
        }
        if (updatedShop.reportsCount >= 3) {
            newStatus = "SUSPENDED";
        }
        if (newStatus !== updatedShop.status) {
            await tx.shop.update({
                where: { id: shopId },
                data: { status: newStatus },
            });
        }
        return {
            report,
            shop: updatedShop,
            newStatus,
        };
    });
    // 🔔 Send Telegram AFTER transaction (never inside transaction)
    const chatId = result.shop.seller?.user?.telegramchatId;
    if (chatId) {
        try {
            let message = `🚨 Your shop has been reported.\n\nReason: ${reason}\nTotal Reports: ${result.shop.reportsCount}`;
            if (result.newStatus === "WARNING") {
                message += `\n\n⚠️ Your shop has received a WARNING. Please review the guidelines.`;
            }
            if (result.newStatus === "SUSPENDED") {
                message += `\n\n⛔ Your shop has been SUSPENDED due to multiple reports.`;
            }
            await (0, Telegram_webhook_js_1.sendTelegramMessage)(chatId, message);
        }
        catch (err) {
            logger_js_1.logger.error("Failed to send Telegram notification", err);
        }
    }
    logger_js_1.logger.info({
        event: "report_created",
        requestId: req.requestId,
        userId,
        shopId,
        reportId: result.report.id,
    });
    res.status(201).json(result.report);
});
exports.getReportsforshop = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const id = req.shop?.id;
    // Ensure id is a string
    if (!id || typeof id !== "string") {
        throw new apperror_js_1.NotFoundError("Invalid product id");
    }
    const reviews = await prisma_js_1.prisma.report.findMany({
        where: { shopId: id },
        select: {
            reason: true,
            createdAt: true
        }
    });
    logger_js_1.logger.info({
        event: 'report_fetched',
        requestId: req.requestId,
        shopid: id
    });
    res.status(200).json({ data: { reviews }, message: "Report fetched successfully" });
});
// send appeal for a shop a seller can send appeal for a shop if it is suspended
exports.sendAppeal = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const shopId = req.params?.shopId;
    const userId = req.user?.id;
    const { reason } = req.body;
    if (!shopId || Array.isArray(shopId)) {
        throw new apperror_js_1.ConflictError("Shop id is required and must be a string");
    }
    if (!userId) {
        throw new apperror_js_1.NotFoundError("User context missing");
    }
    const shop = await prisma_js_1.prisma.shop.findUnique({
        where: { id: shopId },
        select: {
            status: true,
        },
    });
    if (!shop) {
        throw new apperror_js_1.NotFoundError("Shop not found");
    }
    const appeal = await prisma_js_1.prisma.appeal.create({
        data: {
            shopId,
            sellerId: userId,
            message: reason,
        },
    });
    logger_js_1.logger.info({
        event: "appeal_created",
        requestId: req.requestId,
        userId,
        shopId,
        appealId: appeal.id,
    });
    res.status(201).json(appeal);
});
// Admin can get all appeals
exports.getAllAppeals = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const appeals = await prisma_js_1.prisma.appeal.findMany({
        select: {
            id: true,
            message: true,
            createdAt: true,
            shop: {
                select: {
                    id: true,
                    shopName: true,
                },
            },
            seller: {
                select: {
                    id: true,
                    username: true,
                },
            }
        }
    });
    logger_js_1.logger.info({
        event: 'all_appeals_fetched',
        requestId: req.requestId,
    });
    res.status(200).json({
        data: { appeals },
        message: "All appeals fetched successfully"
    });
});
// approve or reject an appeal (Admin only)
exports.handleAppeal = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const appealId = req.params.id;
    const { action } = req.body;
    if (!["APPROVE", "REJECT"].includes(action)) {
        throw new apperror_js_1.ConflictError("Invalid action. Must be APPROVE or REJECT");
    }
    if (!appealId || Array.isArray(appealId)) {
        throw new apperror_js_1.ConflictError("Appeal id is required and must be a string");
    }
    const appeal = await prisma_js_1.prisma.appeal.update({
        where: { id: appealId },
        data: {
            status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        },
        select: {
            id: true,
            status: true,
            shop: {
                select: {
                    id: true,
                    shopName: true,
                },
            },
            seller: {
                select: {
                    id: true,
                    username: true,
                    telegramchatId: true,
                },
            }
        }
    });
    if (action === "APPROVE") {
        await prisma_js_1.prisma.shop.update({
            where: { id: appeal.shop.id },
            data: {
                status: "APPROVED",
                reportsCount: 0,
            }
        });
        await prisma_js_1.prisma.report.deleteMany({
            where: { shopId: appeal.shop.id },
        });
    }
    await (0, Telegram_webhook_js_1.sendTelegramMessage)(appeal.seller.telegramchatId, `Your appeal for shop ${appeal.shop.shopName} has been ${action.toLowerCase()}d.`);
    logger_js_1.logger.info({
        event: 'appeal_handled',
        requestId: req.requestId,
        appealId: appealId,
        action,
    });
    res.status(200).json({
        data: { appeal },
        message: "Appeal handled successfully"
    });
});
// Get all reports (Admin only)
exports.getAllReports = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const reports = await prisma_js_1.prisma.report.findMany({
        select: {
            id: true,
            reason: true,
            createdAt: true,
            shop: {
                select: {
                    id: true,
                    shopName: true,
                },
            },
            reporter: {
                select: {
                    id: true,
                    username: true,
                },
            }
        }
    });
    logger_js_1.logger.info({
        event: 'all_reports_fetched',
        requestId: req.requestId,
    });
    res.status(200).json({
        data: { reports },
        message: "All reports fetched successfully"
    });
});
//# sourceMappingURL=report.controller.js.map