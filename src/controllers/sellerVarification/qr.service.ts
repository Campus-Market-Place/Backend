import jsQR from "jsqr";
import { createCanvas, loadImage } from "canvas";
import { logger } from "../../lib/logger";

export async function decodeQR(image: string | Buffer): Promise<string | null> {
  const img = await loadImage(image);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);

  const qr = jsQR(imageData.data, img.width, img.height);

  logger.info(`Decoded QR code: ${qr ? qr.data : 'No QR code found'}`);
  return qr?.data || null;
}
