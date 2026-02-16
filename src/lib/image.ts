import sharp from "sharp";
import crypto from "crypto";
import fs from "fs/promises";

export async function preprocessImage(input: string | Buffer) {
  const buffer = await sharp(input)
    .resize({ width: 1024, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  return buffer;
}

export async function hashImage(input: string | Buffer) {
  const buffer = Buffer.isBuffer(input) ? input : await fs.readFile(input);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  return hash;
}

export async function deleteTempImages(paths: string[]) {
  await Promise.all(paths.map(p => fs.unlink(p).catch(() => {})));
}
