"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadupdateImages = exports.uploadSellerImages = exports.uploadImages = void 0;
const multer_1 = __importDefault(require("multer"));
// const diskStorage = multer.diskStorage({
//   destination: (_req, _file, cb) => cb(null, os.tmpdir()),
//   filename: (_req, file, cb) => {
//     const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
//     cb(null, `${unique}-${path.basename(file.originalname)}`);
//   },
// });
const memoryStorage = multer_1.default.memoryStorage();
const createUpload = (maxFiles, storage) => (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 1 * 1024 * 1024, // ✅ 1MB per image
        files: maxFiles,
    },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            cb(new Error('Only image files are allowed'));
        }
        else {
            cb(null, true);
        }
    },
});
// Safe wrapper to catch Multer errors
const uploadImages = (req, res, next) => {
    createUpload(5, memoryStorage).array('image', 5)(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            return res.status(400).json({ message: err.message });
        }
        if (err instanceof Error) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};
exports.uploadImages = uploadImages;
const uploadSellerImages = (req, res, next) => {
    createUpload(3, memoryStorage).fields([
        { name: 'image', maxCount: 2 },
        { name: 'profileImage', maxCount: 1 },
    ])(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            return res.status(400).json({ message: err.message });
        }
        if (err instanceof Error) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};
exports.uploadSellerImages = uploadSellerImages;
const uploadupdateImages = (req, res, next) => {
    createUpload(1, memoryStorage).fields([
        { name: 'profileImage', maxCount: 1 },
    ])(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            return res.status(400).json({ message: err.message });
        }
        if (err instanceof Error) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};
exports.uploadupdateImages = uploadupdateImages;
//# sourceMappingURL=uplode.js.map