import { prisma } from "../../lib/prisma.js";
import { extractText } from "./ocr.service.js";
import { decodeQR } from "./qr.service.js";
import { extractStudentId } from "./validation.util.js";
import { calculateScore } from "./scoring.util.js";
import { hashImage, deleteTempImages } from "../../lib/image.js";

export async function verifySeller(userId: string, frontImagePath: string, backImagePath: string) {
  const frontText = await extractText(frontImagePath);
  const backText = await extractText(backImagePath);

  const frontQR = await decodeQR(frontImagePath);
  const backQR = await decodeQR(backImagePath);

  const studentId = extractStudentId(frontText) ?? extractStudentId(backText);
  if (!studentId) throw new Error("Student ID not detected");

  const hasUniversityText =
    (frontText + backText).includes("ADDIS ABABA") &&
    (frontText + backText).includes("SCIENCE AND TECHNOLOGY");

  const qrMatches = [frontQR, backQR].some(qr => qr?.includes(studentId ?? ""));

  const duplicate = await prisma.sellerProfile.findUnique({
    where: { studentId: studentId },
  });

  const score = calculateScore({
    hasUniversityText,
    studentIdValid: !!studentId,
    qrMatches,
    duplicateId: !!duplicate,
  });

  let level: "BASIC" | "VERIFIED" | "FLAGGED" = "FLAGGED";
  if (score >= 8) level = "VERIFIED";
  else if (score >= 6) level = "BASIC";

  if (score < 6) throw new Error("id Verification failed");

  const frontHash = await hashImage(frontImagePath);
  const backHash = await hashImage(backImagePath);

  await deleteTempImages([frontImagePath, backImagePath]);

  return { studentId, score, level, frontHash, backHash };
}
