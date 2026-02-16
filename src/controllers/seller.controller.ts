import { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { catchAsync } from "../middleware/wrapper.js";
import { NotFoundError, ConflictError } from "../errors/apperror.js";
import { Roles, SellerStatuses } from "../constants/auth.js";
import { verifySeller } from "../controllers/sellerVarification/verification.service.js";
import { logger } from "../lib/logger.js";
import { uploadPrivateImageBuffer, uploadImageBuffer, deleteCloudinaryAsset } from "../lib/cloudinary_upload.js";



export const submitSellerRequest = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new NotFoundError("User context missing");

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { sellerProfile: true },
    });

    if (!user || user.deletedAt) throw new NotFoundError("User not found");
    if (user.role === Roles.SELLER) {
        throw new ConflictError("User is already a seller");
    }

    const fileMap = req.files as Record<string, Express.Multer.File[]> | undefined;
    const idImages = fileMap?.image ?? [];
    const shopImageFile = fileMap?.profileImage?.[0];

    if (idImages.length < 2) {
        throw new NotFoundError("Please upload both front and back of your ID");
    }

    if (!shopImageFile) {
        throw new NotFoundError("Please upload a shop profile image");
    }

    const frontIdImage = idImages[0];
    const backIdImage = idImages[1];

    const categories = req.category;

    const { shopName, discription, campusLocation, mainPhone, secondaryPhone, agreedToRules, instagram, telegram, tiktok, other } = req.body;

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



    const toBoolean = (value: any): boolean =>
        value === true || value === "true" || value === "1";

    let frontUpload: { public_id: string } | null = null;
    let backUpload: { public_id: string } | null = null;
    let shopUpload: { public_id: string; secure_url: string } | null = null;
    let verificationResult;

    try {
        if (!frontIdImage.buffer || !backIdImage.buffer || !shopImageFile.buffer) {
            return res.status(400).json({ message: "Invalid image upload payload" });
        }

        // 1️⃣ Verify ID images synchronously (QR decode + hash from buffers)
        verificationResult = await verifySeller(user.id, frontIdImage.buffer, backIdImage.buffer);

        // 2️⃣ Upload to Cloudinary (private for IDs, public for shop image)
        frontUpload = await uploadPrivateImageBuffer(frontIdImage.buffer, { folder: "seller-ids" });
        backUpload = await uploadPrivateImageBuffer(backIdImage.buffer, { folder: "seller-ids" });
        shopUpload = await uploadImageBuffer(shopImageFile.buffer, { folder: "shop-images" });

        // 3️⃣ Create or update sellerProfile in a transaction
        const sellerProfile = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            if (!user.sellerProfile) {
                const existingByStudentId = await tx.sellerProfile.findUnique({
                    where: { studentId: verificationResult.studentId },
                    select: { id: true, userId: true },
                });

                if (existingByStudentId) {
                    throw new ConflictError("Student ID is already registered to another seller");
                }
            }

            const profile = user.sellerProfile
                ? await tx.sellerProfile.update({
                    where: { id: user.sellerProfile.id },
                    data: {
                        campusLocation,
                        mainPhone,
                        secondaryPhone: secondaryPhone || null,
                        agreedToRules: toBoolean(agreedToRules),
                        verificationStatus: SellerStatuses.APPROVED,
                        verificationScore: verificationResult.score,
                        verificationLevel: verificationResult.level,
                        frontImageHash: verificationResult.frontHash,
                        backImageHash: verificationResult.backHash,
                        frontIdImagePublicId: frontUpload.public_id,
                        backIdImagePublicId: backUpload.public_id,
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
                        secondaryPhone: secondaryPhone || null,
                        agreedToRules: toBoolean(agreedToRules),
                        verificationStatus: SellerStatuses.APPROVED,
                        verificationScore: verificationResult.score,
                        verificationLevel: verificationResult.level,
                        frontImageHash: verificationResult.frontHash,
                        backImageHash: verificationResult.backHash,
                        frontIdImagePublicId: frontUpload.public_id,
                        backIdImagePublicId: backUpload.public_id,
                    },
                });

            await tx.user.update({
                where: { id: user.id },
                data: { role: Roles.SELLER },
            });

            await tx.shop.create({
                data: {
                    shopName,
                    categoryId: categories,
                    sellerId: profile.id,
                    bio: discription,
                    profileImageUrl: shopUpload.secure_url,
                    profileImagePublicId: shopUpload.public_id,
                    status: "APPROVED",
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

        return res.status(201).json({
            message: "Seller request submitted and verified successfully",
            sellerStatus: SellerStatuses.APPROVED,
            verificationLevel: verificationResult.level,
        });
    } catch (error) {
        if (frontUpload?.public_id) {
            await deleteCloudinaryAsset(frontUpload.public_id);
        }
        if (backUpload?.public_id) {
            await deleteCloudinaryAsset(backUpload.public_id);
        }
        if (shopUpload?.public_id) {
            await deleteCloudinaryAsset(shopUpload.public_id, "upload");
        }
        throw error;
    }
    
});


// get seller-profile
export const getSellerProfile = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new NotFoundError("User context missing");

    const profile = await prisma.sellerProfile.findUnique({
        where: { userId: req.user.id },
        include: {
            user: {
                select: {
                    username: true,
                    telegramId: true,
                },
            },
            shop: {
                select: {
                    id: true,
                    shopName: true,
                    bio: true,
                    categoryId: true,
                    profileImageUrl: true,
                    status: true
                },
            },
        },
    });

    if (!profile) throw new NotFoundError("Seller profile not found");

    res.status(200).json({
        data: {
            profile
        }
    });
});

export const updateSellerProfile = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new NotFoundError("User context missing");

    const toBoolean = (value: any): boolean =>
        value === true || value === "true" || value === "1";

    const {
        shopName,
        discription,
        campusLocation,
        mainPhone,
        secondaryPhone,
        categoryId,
        agreedToRules,
        instagram,
        telegram,
        tiktok,
        other,
    } = req.body;

    const profile = await prisma.sellerProfile.findUnique({
        where: { userId: req.user.id },
        include: { shop: true },
    });

    if (!profile) throw new NotFoundError("Seller profile not found");

    if (campusLocation && campusLocation.split("-").length !== 2) {
        throw new ConflictError("Invalid campus location format. Expected 'block-dormnumber'");
    }

    if (categoryId) {
        if (!/^[0-9a-fA-F-]{36}$/.test(categoryId)) {
            throw new ConflictError("Invalid categoryId format");
        }
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true },
        });
        if (!category) throw new NotFoundError("Category not found");
    }

    const profileData: Prisma.SellerProfileUpdateInput = {};
    const shopData: Prisma.ShopUpdateInput = {};

    if (campusLocation !== undefined) profileData.campusLocation = campusLocation;
    if (mainPhone !== undefined) profileData.mainPhone = mainPhone;
    if (secondaryPhone !== undefined) profileData.secondaryPhone = secondaryPhone || null;
    if (agreedToRules !== undefined) profileData.agreedToRules = toBoolean(agreedToRules);
    if (instagram !== undefined) profileData.instagram = instagram || null;
    if (telegram !== undefined) profileData.telegram = telegram || null;
    if (tiktok !== undefined) profileData.tiktok = tiktok || null;
    if (other !== undefined) {
        profileData.other = Array.isArray(other) ? other : [other];
    }

    if (shopName !== undefined) shopData.shopName = shopName;
    if (discription !== undefined) shopData.bio = discription;
    if (categoryId !== undefined) shopData.categoryId = categoryId;

    if (Object.keys(profileData).length === 0 && Object.keys(shopData).length === 0) {
        throw new ConflictError("No updatable fields provided");
    }

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const updatedProfile = Object.keys(profileData).length
            ? await tx.sellerProfile.update({
                where: { id: profile.id },
                data: profileData,
            })
            : profile;

        if (profile.shop && Object.keys(shopData).length) {
            await tx.shop.update({
                where: { id: profile.shop.id },
                data: shopData,
            });
        }

        return updatedProfile;
    });

    res.status(200).json({
        message: "Seller profile updated successfully",
        data: { profile: updated },
    });
});


