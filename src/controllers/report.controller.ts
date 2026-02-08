import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { catchAsync } from "../middleware/wrapper.js";
import { NotFoundError, ConflictError } from "../errors/apperror.js";
import { logger } from "../lib/logger.js";

export const createReport = catchAsync(async (req: Request, res: Response) => {
    const shopId = req.shop?.id;

    if (!shopId || Array.isArray(shopId)) {
        throw new ConflictError('Shop id is required and must be a string');
    }

    const userId = req.user?.id;

    if (!userId) throw new NotFoundError("User context missing");

    const { reason } = req.body;

    const report = await prisma.report.create({
        data: {
            shopId,
            reporterId:userId,
            reason,
        },
    });

    const updatedShop = await prisma.shop.findUnique({
        where: { id: shopId },
        select: {
            id: true,
            reportsCount: true,
            status: true,
        },
    });

    if (!updatedShop) {
        throw new NotFoundError("Shop not found");
    }

    if (updatedShop.reportsCount < 3) {
        let newReportsCount = updatedShop.reportsCount + 1;
        let newStatus = updatedShop.status;

        if (newReportsCount >= 3) {
            newStatus = "SUSPENDED";
        }

        await prisma.shop.update({
            where: { id: shopId },
            data: {
                reportsCount: newReportsCount,
                status: newStatus,
                
            },
        });
    } else if (updatedShop.status !== "SUSPENDED") {
        await prisma.shop.update({
            where: { id: shopId },
            data: {
                status: "SUSPENDED",
            },
        });
    }

    logger.info({
        event: 'report_created',
        requestId: req.requestId,
        userId,
        shopId,
        reportId: report.id,
    });

    res.status(201).json(report);
});


export const getReportsforshop = catchAsync(async (req: Request, res: Response) => {
    const id  = req.shop?.id;


    // Ensure id is a string
    if (!id || typeof id !== "string") {
        throw new NotFoundError("Invalid product id");
    }

    const reviews = await prisma.report.findMany({
        where : {shopId : id},
        select : {
            reason : true,
            createdAt : true

        }
    })

    logger.info({
        event: 'report_fetched',
        requestId: req.requestId,
        shopid : id
    });

    res.status(200).json({ data: { reviews }, message: "Report fetched successfully" });
});
