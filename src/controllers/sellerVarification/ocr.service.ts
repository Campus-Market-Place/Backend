import Tesseract from "tesseract.js";
import { preprocessImage } from "../../lib/image.js";

export async function extractText(image: string | Buffer): Promise<string> {
  const buffer = await preprocessImage(image);
  const result = await Tesseract.recognize(buffer, "eng", { logger: () => {} });
  return result.data.text;
}
