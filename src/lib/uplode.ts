import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import os from 'os';
import path from 'path';

// const diskStorage = multer.diskStorage({
//   destination: (_req, _file, cb) => cb(null, os.tmpdir()),
//   filename: (_req, file, cb) => {
//     const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
//     cb(null, `${unique}-${path.basename(file.originalname)}`);
//   },
// });

const memoryStorage = multer.memoryStorage();

const createUpload = (maxFiles: number, storage: multer.StorageEngine) => multer({
  storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // ✅ 1MB per image
    files: maxFiles,
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
    } else {
      cb(null, true);
    }
  },
});

// Safe wrapper to catch Multer errors
export const uploadImages = (req: Request, res: Response, next: NextFunction) => {
  createUpload(5, memoryStorage).array('image', 5)(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

export const uploadSellerImages = (req: Request, res: Response, next: NextFunction) => {
  createUpload(3, memoryStorage).fields([
    { name: 'image', maxCount: 2 },
    { name: 'profileImage', maxCount: 1 },
  ])(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};


export const uploadupdateImages = (req: Request, res: Response, next: NextFunction) => {
  createUpload(1, memoryStorage).fields([
    { name: 'profileImage', maxCount: 1 },
  ])(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};