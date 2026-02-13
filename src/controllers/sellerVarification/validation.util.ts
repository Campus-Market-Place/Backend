import { logger } from "../../lib/logger";

export function extractStudentId(text: string): string | null {
  const match = text.match(/(?:SID\s*NO\.?\s*[:\-]?\s*)?\(?([A-Z]{2,4}\d{3,6}\/\d{2})\)?/i);

  logger.info(`Extracted student ID from OCR text: ${match ? match[1] : 'No match found'}`);

  return match && match[1] ? match[1].toUpperCase() : null;
}

export function extractName(text: string): string | null {
  const match = text.match(/Full Name\s+([A-Z\s]+)/i);
  return match && match[1] ? match[1].trim() : null;
}
