"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySeller = verifySeller;
const prisma_js_1 = require("../../lib/prisma.js");
const ocr_service_js_1 = require("./ocr.service.js");
const qr_service_js_1 = require("./qr.service.js");
const scoring_util_js_1 = require("./scoring.util.js");
const image_js_1 = require("../../lib/image.js");
const logger_js_1 = require("../../lib/logger.js");
async function verifySeller(userId, frontImage, backImage) {
    const frontText = await (0, ocr_service_js_1.extractText)(frontImage);
    const backText = await (0, ocr_service_js_1.extractText)(backImage);
    const frontQR = await (0, qr_service_js_1.decodeQR)(frontImage);
    const backQR = await (0, qr_service_js_1.decodeQR)(backImage);
    const qrPayloads = [frontQR, backQR].filter((qr) => !!qr);
    const studentIdMatch = qrPayloads
        .map(qr => qr.match(/([A-Z]{2,4}\d{3,6}\/\d{2})/i))
        .find(match => match && match[1]);
    const studentId = studentIdMatch?.[1]?.toUpperCase() ?? null;
    if (!studentId)
        throw new Error("Student ID not detected from QR");
    const hasUniversityText = (frontText + backText).includes("ADDIS ABABA") &&
        (frontText + backText).includes("SCIENCE AND TECHNOLOGY");
    const qrMatches = qrPayloads.some(qr => qr.toUpperCase().includes(studentId));
    const duplicate = await prisma_js_1.prisma.sellerProfile.findUnique({
        where: { studentId: studentId },
    });
    logger_js_1.logger.info(`Verification details for user ${userId}: studentId=${studentId}, hasUniversityText=${hasUniversityText}, qrMatches=${qrMatches}, duplicate=${!!duplicate}`);
    const score = (0, scoring_util_js_1.calculateScore)({
        hasUniversityText,
        studentIdValid: !!studentId,
        qrMatches,
        duplicateId: !!duplicate,
    });
    console.log(`Calculated verification score for user ${userId}: ${score}`);
    let level = "FLAGGED";
    if (score >= 8)
        level = "VERIFIED";
    else if (score >= 6)
        level = "BASIC";
    if (score < 6) {
        logger_js_1.logger.warn({
            event: "seller_verification_failed",
            userId,
            studentIdDetected: !!studentId,
            hasUniversityText,
            qrMatches,
            duplicateId: !!duplicate,
            score,
        });
        throw new Error("id Verification failed");
    }
    const frontHash = await (0, image_js_1.hashImage)(frontImage);
    const backHash = await (0, image_js_1.hashImage)(backImage);
    return { studentId, score, level, frontHash, backHash };
}
// import { prisma } from "../../lib/prisma.js";
// import { decodeQR } from "./qr.service.js";
// import { hashImage, deleteTempImages } from "../../lib/image.js";
// import { logger } from "../../lib/logger.js";
// function extractStudentIdFromQR(qrText: string): string | null {
//   const match = qrText.match(/[A-Z]{2,4}\d{3,6}\/\d{2}/i);
//   return match ? match[0].toUpperCase() : null;
// }
// export async function verifySeller(
//   userId: string,
//   frontImagePath: string,
//   backImagePath: string
// ) {
//   // 1️⃣ Decode QR from both images
//   const frontQR = await decodeQR(frontImagePath);
//   const backQR = await decodeQR(backImagePath);
//   const qrPayload = frontQR || backQR;
//   if (!qrPayload) {
//     throw new Error("QR code not detected");
//   }
//   // 2️⃣ Extract Student ID from QR text
//   const studentId = extractStudentIdFromQR(qrPayload);
//   if (!studentId) {
//     throw new Error("Student ID not found inside QR");
//   }
//   // 3️⃣ Check duplicate student ID
//   const duplicate = await prisma.sellerProfile.findUnique({
//     where: { studentId },
//   });
//   if (duplicate) {
//     throw new Error("Student ID already registered");
//   }
//   // 4️⃣ Hash images
//   const frontHash = await hashImage(frontImagePath);
//   const backHash = await hashImage(backImagePath);
//   // 5️⃣ Delete temp files
//   await deleteTempImages([frontImagePath, backImagePath]);
//   logger.info(
//     `Seller verified successfully: user=${userId}, studentId=${studentId}`
//   );
//   return {
//     studentId,
//     level: "VERIFIED" as const,
//     score: 10,
//     frontHash,
//     backHash,
//   };
// }
//# sourceMappingURL=verification.service.js.map