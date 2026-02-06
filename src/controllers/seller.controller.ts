import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { catchAsync } from "../middleware/wrapper.js";
import { NotFoundError, ConflictError } from "../errors/apperror.js";
import { Roles, SellerStatuses } from "../constants/auth.js";
import { verifySeller } from "../controllers/sellerVarification/verification.service.js";
import { logger } from "../lib/logger.js";

export const submitSellerRequest = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new NotFoundError("User context missing");

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { sellerProfile: true },
    });

    if (!user || user.deletedAt) throw new NotFoundError("User not found");
    if (user.role === Roles.SELLER || user.sellerStatus === SellerStatuses.APPROVED) {
        throw new ConflictError("User is already a seller");
    }

    const { shopName, discription, campusLocation, categories, mainPhone, secondaryPhone, frontIdImage, backIdImage, agreedToRules, instagram, telegram, tiktok, other } = req.body;

    if (!frontIdImage || !backIdImage) {
        return res.status(400).json({ message: "Both front and back ID images are required" });
    }

    if (!agreedToRules) {
        return res.status(400).json({ message: "You must agree to the rules to become a seller" });
    }

    // campusLocation  - block-dormnumber
    if (campusLocation.split("-").length !== 2) {
        return res.status(400).json({ message: "Invalid campus location format. Expected 'block-dormnumber'" });
    }
    const [block, dormNumber] = campusLocation.split("-");
    if (!block || !dormNumber) {
        return res.status(400).json({ message: "Invalid campus location. Block and dorm number are required" });
    }



    // 1️⃣ Verify ID images synchronously
    const verificationResult = await verifySeller(user.id, frontIdImage, backIdImage);



    // 2️⃣ Create or update sellerProfile in a transaction
    const sellerProfile = await prisma.$transaction(async tx => {
        const profile = user.sellerProfile
            ? await tx.sellerProfile.update({
                where: { id: user.sellerProfile.id },
                data: {
                    campusLocation,
                    mainPhone,
                    secondaryPhone,
                    agreedToRules,
                    verificationStatus: SellerStatuses.APPROVED,
                    verificationScore: verificationResult.score,
                    verificationLevel: verificationResult.level,
                    frontImageHash: verificationResult.frontHash,
                    backImageHash: verificationResult.backHash,
                },
            })
            : await tx.sellerProfile.create({
                data: {
                    userId: user.id,
                    studentId: verificationResult.studentId,
                    campusLocation,
                    instagram: instagram || null,
                    telegram: telegram || null,
                    tiktok: tiktok || null,
                    other: Array.isArray(other) ? other : (other ? [other] : []),
                    mainPhone,
                    secondaryPhone,
                    agreedToRules,
                    verificationStatus: SellerStatuses.APPROVED,
                    verificationScore: verificationResult.score,
                    verificationLevel: verificationResult.level,
                    frontImageHash: verificationResult.frontHash,
                    backImageHash: verificationResult.backHash,
                },
            });

        await tx.user.update({
            where: { id: user.id },
            data: { role: Roles.SELLER, sellerStatus: SellerStatuses.APPROVED },
        });

        await tx.shop.create({
            data: {
                shopName,
                categoryId: categories,
                sellerId: profile.id,
                bio: discription,
            },
        });

        return profile;
    });

    logger.info({
        event: "seller_request_verified",
        requestId: req.requestId,
        userId: user.id,
        sellerProfileId: sellerProfile.id,
        verificationScore: verificationResult.score,
        verificationLevel: verificationResult.level,
    });

    res.status(201).json({
        message: "Seller request submitted and verified successfully",
        sellerStatus: SellerStatuses.APPROVED,
        verificationLevel: verificationResult.level,
    });
});
