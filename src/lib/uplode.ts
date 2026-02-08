import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Multer config
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 1 * 1024 * 1024, // ✅ 1MB per image
    files: 5,                 // ✅ max 5 images
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
    } else {
      cb(null, true);
    }
  },
});

// Safe wrapper to catch Multer errors
export const uploadImages = (req: Request, res: Response, next: NextFunction) => {
  upload.array('image', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};
