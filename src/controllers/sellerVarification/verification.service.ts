// import { prisma } from "../../lib/prisma.js";
// import { extractText } from "./ocr.service.js";
// import { decodeQR } from "./qr.service.js";
// import { calculateScore } from "./scoring.util.js";
// import { hashImage, deleteTempImages } from "../../lib/image.js";
// import { logger } from "../../lib/logger.js";

// export async function verifySeller(userId: string, frontImagePath: string, backImagePath: string) {
//   const frontText = await extractText(frontImagePath);
//   const backText = await extractText(backImagePath);

//   const frontQR = await decodeQR(frontImagePath);
//   const backQR = await decodeQR(backImagePath);

//   const qrPayloads = [frontQR, backQR].filter((qr): qr is string => !!qr);
//   const studentIdMatch = qrPayloads
//     .map(qr => qr.match(/([A-Z]{2,4}\d{3,6}\/\d{2})/i))
//     .find(match => match && match[1]);
//   const studentId = studentIdMatch?.[1]?.toUpperCase() ?? null;
//   if (!studentId) throw new Error("Student ID not detected from QR");

//   const hasUniversityText =
//     (frontText + backText).includes("ADDIS ABABA") &&
//     (frontText + backText).includes("SCIENCE AND TECHNOLOGY");

//   const qrMatches = qrPayloads.some(qr => qr.toUpperCase().includes(studentId));

//   const duplicate = await prisma.sellerProfile.findUnique({
//     where: { studentId: studentId },
//   });

//   logger.info(`Verification details for user ${userId}: studentId=${studentId}, hasUniversityText=${hasUniversityText}, qrMatches=${qrMatches}, duplicate=${!!duplicate}`);


//   const score = calculateScore({
//     hasUniversityText,
//     studentIdValid: !!studentId,
//     qrMatches,
//     duplicateId: !!duplicate,
//   });

//   let level: "BASIC" | "VERIFIED" | "FLAGGED" = "FLAGGED";
//   if (score >= 8) level = "VERIFIED";
//   else if (score >= 6) level = "BASIC";

//   if (score < 6) {
//     logger.warn({
//       event: "seller_verification_failed",
//       userId,
//       studentIdDetected: !!studentId,
//       hasUniversityText,
//       qrMatches,
//       duplicateId: !!duplicate,
//       score,
//     });
    
    
//     throw new Error("id Verification failed");
//   }

//   const frontHash = await hashImage(frontImagePath);
//   const backHash = await hashImage(backImagePath);

//   await deleteTempImages([frontImagePath, backImagePath]);

//   return { studentId, score, level, frontHash, backHash };
// }

import { prisma } from "../../lib/prisma.js";
import { decodeQR } from "./qr.service.js";
import { hashImage, deleteTempImages } from "../../lib/image.js";
import { logger } from "../../lib/logger.js";

function extractStudentIdFromQR(qrText: string): string | null {
  const match = qrText.match(/[A-Z]{2,4}\d{3,6}\/\d{2}/i);
  return match ? match[0].toUpperCase() : null;
}

export async function verifySeller(
  userId: string,
  frontImagePath: string,
  backImagePath: string
) {
  // 1️⃣ Decode QR from both images
  const frontQR = await decodeQR(frontImagePath);
  const backQR = await decodeQR(backImagePath);

  const qrPayload = frontQR || backQR;

  if (!qrPayload) {
    throw new Error("QR code not detected");
  }

  // 2️⃣ Extract Student ID from QR text
  const studentId = extractStudentIdFromQR(qrPayload);

  if (!studentId) {
    throw new Error("Student ID not found inside QR");
  }

  // 3️⃣ Check duplicate student ID
  const duplicate = await prisma.sellerProfile.findUnique({
    where: { studentId },
  });

  if (duplicate) {
    throw new Error("Student ID already registered");
  }

  // 4️⃣ Hash images
  const frontHash = await hashImage(frontImagePath);
  const backHash = await hashImage(backImagePath);

  // 5️⃣ Delete temp files
  await deleteTempImages([frontImagePath, backImagePath]);

  logger.info(
    `Seller verified successfully: user=${userId}, studentId=${studentId}`
  );

  return {
    studentId,
    level: "VERIFIED" as const,
    score: 10,
    frontHash,
    backHash,
  };
}
