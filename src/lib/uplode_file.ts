

import { Request, Response } from 'express';

// Helper: normalize multer files
export function getUploadedFiles(req: Request): Express.Multer.File[] {
  const files = req.files;
  if (Array.isArray(files)) return files as Express.Multer.File[];
  if (files && typeof files === "object") {
    // handle multer.fields(...)
    return Object.values(files).flat() as Express.Multer.File[];
  }
  return [];
}