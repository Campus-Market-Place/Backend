import jsQR from "jsqr";
import { createCanvas, loadImage } from "canvas";

export async function decodeQR(imagePath: string): Promise<string | null> {
  const img = await loadImage(imagePath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);

  const qr = jsQR(imageData.data, img.width, img.height);
  return qr?.data || null;
}
