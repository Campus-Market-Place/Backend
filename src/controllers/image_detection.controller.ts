import express from "express";
import multer from "multer";
import sharp from "sharp";
import imghash from "imghash";
import { exiftool } from "exiftool-vendored";
import { prisma } from '../lib/prisma.js';

const app = express();
const upload = multer({ dest: "uploads/" });

/* =====================
   4. IMAGE ANALYSIS HELPERS
   ===================== */

const SOCIAL_SIZES = [
    [1080, 1080], [1080, 1350], [1080, 1920],
    [1200, 630], [1280, 720]
];

function isSocialSize(w?: number, h?: number) {
    if (!w || !h) return false;
    return SOCIAL_SIZES.some(([sw, sh]) =>
        sw !== undefined && sh !== undefined &&
        (Math.abs(sw - w) < 10 && Math.abs(sh - h) < 10)
    );
}


async function detectBlur(path: string) {
    const { data, info } = await sharp(path)
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

    let mean = 0;
    for (const v of data) mean += v;
    mean /= data.length;

    let variance = 0;
    for (const v of data) variance += (v - mean) ** 2;
    variance /= data.length;

    return variance; // lower = blurrier
}

async function checkQuality(path: string) {
    const img = sharp(path);
    const meta = await img.metadata();

    let penalty = 0;
    let reasons: string[] = [];

    if (!meta.width || !meta.height || meta.width < 800 || meta.height < 800) {
        penalty += 30;
        reasons.push("Low resolution image");
    }

    // Blur detection
    const blurScore = await detectBlur(path);
    if (blurScore < 15) {
        penalty += 40;
        reasons.push("Image is blurry");
    }

    // Social-media resolution patterns
    if (isSocialSize(meta.width, meta.height)) {
        penalty += 20;
        reasons.push("Matches common social-media image dimensions");
    }

    return { penalty, reasons, width: meta.width, height: meta.height };
}

async function checkExif(path: string) {
    const exif = await exiftool.read(path);

    let penalty = 0;
    let bonus = 0;
    let reasons: string[] = [];

    if (!exif.Make || !exif.Model) {
        penalty += 25;
        reasons.push("Missing camera make or model (typical of social media)");
    }
    if (!exif.DateTimeOriginal) {
        penalty += 15;
        reasons.push("Missing original capture time");
    }

    if (exif.Software) {
        if (/instagram|whatsapp|facebook|telegram/i.test(exif.Software)) {
            penalty += 40;
            reasons.push("Detected social media software signature");
        } else {
            penalty += 20;
            reasons.push("Image appears edited (software detected)");
        }
    }

    if (exif.GPSLatitude) bonus += 10;

    return {
        penalty,
        bonus,
        make: exif.Make,
        model: exif.Model,
        reasons,
    };
}

function hammingDistance(a: string, b: string): number {
    if (a.length !== b.length) throw new Error("Hash lengths do not match");
    let dist = 0;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) dist++;
    }
    return dist;
}

async function checkReuse(path: string) {
    const hash = await imghash.hash(path, 16);

    /*   const existing = await prisma.productImage.findMany({
          select: { phash: true },
      }); */

    const existing = await prisma.productImage.findMany({
        where: {
            phash: { startsWith: hash.slice(0, 6) }
        },
        select: { phash: true }
    });


    let penalty = 0;
    let reasons: string[] = [];

    for (const img of existing) {
        const dist = hammingDistance(hash, img.phash);
        if (dist < 6) {
            penalty = 50;
            reasons.push("Image reused from another listing");
            break;
        }
    }

    return { penalty, hash, reasons };
}

/* =====================
   5. SCORING ENGINE
   ===================== */

async function sellerTrustBonus(userId: string) {
    const approved = await prisma.productImage.count({
        where: { userId, status: "APPROVED" },
    });

    if (approved >= 15) return 20;
    if (approved >= 5) return 10;
    return 0;
}

export async function scoreImage(path: string, userId: string) {
    let score = 100;
    let reasons: string[] = [];

    const quality = await checkQuality(path);
    score -= quality.penalty;
    reasons.push(...quality.reasons);

    const exif = await checkExif(path);
    score -= exif.penalty;
    score += exif.bonus;
    reasons.push(...exif.reasons);

    const reuse = await checkReuse(path);
    score -= reuse.penalty;
    reasons.push(...reuse.reasons);

    score += await sellerTrustBonus(userId);

    let status: "APPROVED" | "REVIEW" | "REJECTED" = "APPROVED";

    if (score < 50) status = "REJECTED";
    else if (score < 75) status = "REVIEW";

    return {
        score,
        status,
        reasons,
        hash: reuse.hash,
        make: exif.make,
        model: exif.model,
    };
}

/* =====================
   6. UPLOAD ENDPOINT
   ===================== */

// app.post("/seller/upload-image", upload.single("image"), async (req, res) => {
//     try {
//         const userId = String(req.body.userId);
//         const filePath = req.file!.path;

//         const result = await scoreImage(filePath, userId);

//         const record = await prisma.productImage.create({
//             data: {
//                 productId: req.body.productId,
//                 userId: userId,
//                 imagePath: filePath,
//                 phash: result.hash,
//                 score: result.score,
//                 status: result.status,
//                 reasons: result.reasons,
//                 cameraMake: result.make ?? null,
//                 cameraModel: result.model ?? null,
//             },
//         });

//         if (result.status === "REJECTED") {
//             return res.status(400).json({
//                 message:
//                     "This image looks like it was taken from social media or is unclear. Please upload a camera photo or request manual review.",
//                 reasons: result.reasons,
//                 score: result.score,
//             });
//         }

//         res.json({
//             message: "Image uploaded",
//             status: result.status,
//             score: result.score,
//             reasons: result.reasons,
//             imageId: record.id,
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Image processing failed" });
//     }
// });

// /* =====================
//    7. ADMIN REVIEW ENDPOINT
//    ===================== */

// app.post("/admin/review/:id", async (req, res) => {
//     const { id } = req.params;
//     const { approve } = req.body;

//     const status = approve ? "APPROVED" : "REJECTED";

//     await prisma.productImage.update({
//         where: { id },
//         data: { status, reviewed: true },
//     });

//     res.json({ message: "Review completed" });
// });

// /* =====================
//    8. SERVER
//    ===================== */

// app.listen(3000, () => {
//     console.log("🚀 Image verification service running on :3000");
// });
