import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { catchAsync } from "../middleware/wrapper.js";
import { NotFoundError, ConflictError } from "../errors/apperror.js";
import { logger } from "../lib/logger.js";
import { sendTelegramMessage } from "../lib/Telegram_webhook.js";

export const createReport = catchAsync(async (req: Request, res: Response) => {
    const shopId = req.shop?.id;
    const userId = req.user?.id;
    const { reason } = req.body;

    if (!shopId || Array.isArray(shopId)) {
        throw new ConflictError("Shop id is required and must be a string");
    }

    if (!userId) {
        throw new NotFoundError("User context missing");
    }

    // Check duplicate report first
    const existingReport = await prisma.report.findFirst({
        where: { reporterId: userId, shopId },
    });

    if (existingReport) {
        throw new ConflictError("You have already reported this shop");
    }

    // 🔥 Use transaction to prevent race condition
    const result = await prisma.$transaction(async (tx) => {
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

            await sendTelegramMessage(chatId, message);
        } catch (err) {
            logger.error("Failed to send Telegram notification", err);
        }
    }

    logger.info({
        event: "report_created",
        requestId: req.requestId,
        userId,
        shopId,
        reportId: result.report.id,
    });

    res.status(201).json(result.report);
});



export const getReportsforshop = catchAsync(async (req: Request, res: Response) => {
    const id = req.shop?.id;


    // Ensure id is a string
    if (!id || typeof id !== "string") {
        throw new NotFoundError("Invalid product id");
    }

    const reviews = await prisma.report.findMany({
        where: { shopId: id },
        select: {
            reason: true,
            createdAt: true

        }
    })

    logger.info({
        event: 'report_fetched',
        requestId: req.requestId,
        shopid: id
    });

    res.status(200).json({ data: { reviews }, message: "Report fetched successfully" });
});


// send appeal for a shop a seller can send appeal for a shop if it is suspended
export const sendAppeal = catchAsync(async (req: Request, res: Response) => {
    const shopId = req.params?.shopId;
    const userId = req.user?.id;
    const { reason } = req.body;

    if (!shopId || Array.isArray(shopId)) {
        throw new ConflictError("Shop id is required and must be a string");
    }

    if (!userId) {
        throw new NotFoundError("User context missing");
    }

    const shop = await prisma.shop.findUnique({
        where: { id: shopId },
        select: {
            status: true,
        },
    });

    if (!shop) {
        throw new NotFoundError("Shop not found");
    }

    if (shop.status !== "SUSPENDED" && shop.status !== "WARNING") {
        throw new ConflictError("Only suspended & warning shops can be appealed");
    }

    const appeal = await prisma.appeal.create({
        data: {
            shopId,
            sellerId: userId,
            message: reason,
        },
    });

    logger.info({
        event: "appeal_created",
        requestId: req.requestId,
        userId,
        shopId,
        appealId: appeal.id,
    });

    res.status(201).json(appeal);
});


// Admin can get all appeals
export const getAllAppeals = catchAsync(async (req: Request, res: Response) => {
    const appeals = await prisma.appeal.findMany({
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

    logger.info({
        event: 'all_appeals_fetched',
        requestId: req.requestId,
    });

    res.status(200).json({
        data: { appeals },
        message: "All appeals fetched successfully"
    });
});

// approve or reject an appeal (Admin only)
export const handleAppeal = catchAsync(async (req: Request, res: Response) => {
    const appealId = req.params.id;
    const { action } = req.body;

    if (!["APPROVE", "REJECT"].includes(action)) {
        throw new ConflictError("Invalid action. Must be APPROVE or REJECT");
    }

    if (!appealId || Array.isArray(appealId)) {
        throw new ConflictError("Appeal id is required and must be a string");
    }

    const appeal = await prisma.appeal.update({
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
        await prisma.shop.update({
            where: { id: appeal.shop.id },
            data: {
                status: "APPROVED",
                reportsCount: 0,
            }
        });
    }

    await sendTelegramMessage(appeal.seller.telegramchatId, `Your appeal for shop ${appeal.shop.shopName} has been ${action.toLowerCase()}d.`);


    logger.info({
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
export const getAllReports = catchAsync(async (req: Request, res: Response) => {
    const reports = await prisma.report.findMany({
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

    logger.info({
        event: 'all_reports_fetched',
        requestId: req.requestId,
    });

    res.status(200).json({
        data: { reports },
        message: "All reports fetched successfully"
    });
});