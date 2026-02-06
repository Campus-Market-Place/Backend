import Tesseract from "tesseract.js";
import { preprocessImage } from "../../lib/image.js";

export async function extractText(imagePath: string): Promise<string> {
  const buffer = await preprocessImage(imagePath);
  const result = await Tesseract.recognize(buffer, "eng", { logger: () => {} });
  return result.data.text;
}
