import sharp from "sharp";
import crypto from "crypto";
import fs from "fs/promises";

export async function preprocessImage(path: string) {
  const buffer = await sharp(path)
    .resize({ width: 1024, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  return buffer;
}

export async function hashImage(path: string) {
  const buffer = await fs.readFile(path);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  return hash;
}

export async function deleteTempImages(paths: string[]) {
  await Promise.all(paths.map(p => fs.unlink(p).catch(() => {})));
}
