"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSellerProfile = exports.getSellerProfile = exports.submitSellerRequest = void 0;
const prisma_js_1 = require("../lib/prisma.js");
const wrapper_js_1 = require("../middleware/wrapper.js");
const apperror_js_1 = require("../errors/apperror.js");
const auth_js_1 = require("../constants/auth.js");
const verification_service_js_1 = require("../controllers/sellerVarification/verification.service.js");
const logger_js_1 = require("../lib/logger.js");
const cloudinary_upload_js_1 = require("../lib/cloudinary_upload.js");
exports.submitSellerRequest = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    if (!req.user)
        throw new apperror_js_1.NotFoundError("User context missing");
    const user = await prisma_js_1.prisma.user.findUnique({
        where: { id: req.user.id },
        include: { sellerProfile: true },
    });
    if (!user || user.deletedAt)
        throw new apperror_js_1.NotFoundError("User not found");
    if (user.role === auth_js_1.Roles.SELLER) {
        throw new apperror_js_1.ConflictError("User is already a seller");
    }
    const fileMap = req.files;
    const idImages = fileMap?.image ?? [];
    const shopImageFile = fileMap?.profileImage?.[0];
    if (idImages.length < 2) {
        throw new apperror_js_1.NotFoundError("Please upload both front and back of your ID");
    }
    if (!shopImageFile) {
        throw new apperror_js_1.NotFoundError("Please upload a shop profile image");
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
    const toBoolean = (value) => value === true || value === "true" || value === "1";
    let frontUpload = null;
    let backUpload = null;
    let shopUpload = null;
    let verificationResult;
    try {
        if (!frontIdImage.buffer || !backIdImage.buffer || !shopImageFile.buffer) {
            return res.status(400).json({ message: "Invalid image upload payload" });
        }
        // 1️⃣ Verify ID images synchronously (QR decode + hash from buffers)
        verificationResult = await (0, verification_service_js_1.verifySeller)(user.id, frontIdImage.buffer, backIdImage.buffer);
        // 2️⃣ Upload to Cloudinary (private for IDs, public for shop image)
        frontUpload = await (0, cloudinary_upload_js_1.uploadPrivateImageBuffer)(frontIdImage.buffer, { folder: "seller-ids" });
        backUpload = await (0, cloudinary_upload_js_1.uploadPrivateImageBuffer)(backIdImage.buffer, { folder: "seller-ids" });
        shopUpload = await (0, cloudinary_upload_js_1.uploadImageBuffer)(shopImageFile.buffer, { folder: "shop-images" });
        // 3️⃣ Create or update sellerProfile in a transaction
        const sellerProfile = await prisma_js_1.prisma.$transaction(async (tx) => {
            if (!user.sellerProfile) {
                const existingByStudentId = await tx.sellerProfile.findUnique({
                    where: { studentId: verificationResult.studentId },
                    select: { id: true, userId: true },
                });
                if (existingByStudentId) {
                    throw new apperror_js_1.ConflictError("Student ID is already registered to another seller");
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
                        verificationStatus: auth_js_1.SellerStatuses.APPROVED,
                        verificationScore: verificationResult.score,
                        verificationLevel: verificationResult.level,
                        frontImageHash: verificationResult.frontHash,
                        backImageHash: verificationResult.backHash,
                        frontIdImagePublicId: frontUpload?.public_id ?? "",
                        backIdImagePublicId: backUpload?.public_id ?? "",
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
                        verificationStatus: auth_js_1.SellerStatuses.APPROVED,
                        verificationScore: verificationResult.score,
                        verificationLevel: verificationResult.level,
                        frontImageHash: verificationResult.frontHash,
                        backImageHash: verificationResult.backHash,
                        frontIdImagePublicId: frontUpload?.public_id ?? "",
                        backIdImagePublicId: backUpload?.public_id ?? "",
                    },
                });
            await tx.user.update({
                where: { id: user.id },
                data: { role: auth_js_1.Roles.SELLER },
            });
            await tx.shop.create({
                data: {
                    shopName,
                    categoryId: categories,
                    sellerId: profile.id,
                    bio: discription,
                    profileImageUrl: shopUpload?.secure_url ?? "",
                    profileImagePublicId: shopUpload?.public_id ?? "",
                    status: "APPROVED",
                },
            });
            return profile;
        });
        logger_js_1.logger.info({
            event: "seller_request_verified",
            requestId: req.requestId,
            userId: user.id,
            sellerProfileId: sellerProfile.id,
            verificationScore: verificationResult.score,
            verificationLevel: verificationResult.level,
        });
        return res.status(201).json({
            message: "Seller request submitted and verified successfully",
            sellerStatus: auth_js_1.SellerStatuses.APPROVED,
            verificationLevel: verificationResult.level,
        });
    }
    catch (error) {
        if (frontUpload?.public_id) {
            await (0, cloudinary_upload_js_1.deleteCloudinaryAsset)(frontUpload.public_id);
        }
        if (backUpload?.public_id) {
            await (0, cloudinary_upload_js_1.deleteCloudinaryAsset)(backUpload.public_id);
        }
        if (shopUpload?.public_id) {
            await (0, cloudinary_upload_js_1.deleteCloudinaryAsset)(shopUpload.public_id, "upload");
        }
        throw error;
    }
});
// get seller-profile
exports.getSellerProfile = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    if (!req.user)
        throw new apperror_js_1.NotFoundError("User context missing");
    const profile = await prisma_js_1.prisma.sellerProfile.findUnique({
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
    if (!profile)
        throw new apperror_js_1.NotFoundError("Seller profile not found");
    res.status(200).json({
        data: {
            profile
        }
    });
});
exports.updateSellerProfile = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    if (!req.user)
        throw new apperror_js_1.NotFoundError("User context missing");
    const toBoolean = (value) => value === true || value === "true" || value === "1";
    const { shopName, discription, campusLocation, mainPhone, secondaryPhone, categoryId, agreedToRules, instagram, telegram, tiktok, other, } = req.body;
    const fileMap = req.files;
    const profileImageFile = fileMap?.profileImage?.[0];
    const profile = await prisma_js_1.prisma.sellerProfile.findUnique({
        where: { userId: req.user.id },
        include: { shop: true },
    });
    if (!profile)
        throw new apperror_js_1.NotFoundError("Seller profile not found");
    if (campusLocation && campusLocation.split("-").length !== 2) {
        throw new apperror_js_1.ConflictError("Invalid campus location format. Expected 'block-dormnumber'");
    }
    if (categoryId) {
        if (!/^[0-9a-fA-F-]{36}$/.test(categoryId)) {
            throw new apperror_js_1.ConflictError("Invalid categoryId format");
        }
        const category = await prisma_js_1.prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true },
        });
        if (!category)
            throw new apperror_js_1.NotFoundError("Category not found");
    }
    const profileData = {};
    const shopData = {};
    if (campusLocation !== undefined)
        profileData.campusLocation = campusLocation;
    if (mainPhone !== undefined)
        profileData.mainPhone = mainPhone;
    if (secondaryPhone !== undefined)
        profileData.secondaryPhone = secondaryPhone || null;
    if (agreedToRules !== undefined)
        profileData.agreedToRules = toBoolean(agreedToRules);
    if (instagram !== undefined)
        profileData.instagram = instagram || null;
    if (telegram !== undefined)
        profileData.telegram = telegram || null;
    if (tiktok !== undefined)
        profileData.tiktok = tiktok || null;
    if (other !== undefined) {
        profileData.other = Array.isArray(other) ? other : [other];
    }
    if (shopName !== undefined)
        shopData.shopName = shopName;
    if (discription !== undefined)
        shopData.bio = discription;
    if (categoryId !== undefined)
        shopData.categoryId = categoryId;
    let shopImageUpload = null;
    const oldShopImagePublicId = profile.shop?.profileImagePublicId ?? null;
    if (profileImageFile?.buffer) {
        shopImageUpload = await (0, cloudinary_upload_js_1.uploadImageBuffer)(profileImageFile.buffer, { folder: "shop-images" });
        shopData.profileImageUrl = shopImageUpload.secure_url;
        shopData.profileImagePublicId = shopImageUpload.public_id;
    }
    if (Object.keys(profileData).length === 0 && Object.keys(shopData).length === 0) {
        throw new apperror_js_1.ConflictError("No updatable fields provided");
    }
    if (!profile.shop && Object.keys(shopData).length) {
        throw new apperror_js_1.NotFoundError("Seller shop not found");
    }
    let updated;
    try {
        updated = await prisma_js_1.prisma.$transaction(async (tx) => {
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
    }
    catch (error) {
        if (shopImageUpload?.public_id) {
            await (0, cloudinary_upload_js_1.deleteCloudinaryAsset)(shopImageUpload.public_id, "upload");
        }
        throw error;
    }
    if (shopImageUpload && oldShopImagePublicId) {
        await (0, cloudinary_upload_js_1.deleteCloudinaryAsset)(oldShopImagePublicId, "upload");
    }
    res.status(200).json({
        message: "Seller profile updated successfully",
        data: { profile: updated },
    });
});
//# sourceMappingURL=seller.controller.js.map