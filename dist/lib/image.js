"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocessImage = preprocessImage;
exports.hashImage = hashImage;
exports.deleteTempImages = deleteTempImages;
const sharp_1 = __importDefault(require("sharp"));
const crypto_1 = __importDefault(require("crypto"));
const promises_1 = __importDefault(require("fs/promises"));
async function preprocessImage(input) {
    const buffer = await (0, sharp_1.default)(input)
        .resize({ width: 1024, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    return buffer;
}
async function hashImage(input) {
    const buffer = Buffer.isBuffer(input) ? input : await promises_1.default.readFile(input);
    const hash = crypto_1.default.createHash("sha256").update(buffer).digest("hex");
    return hash;
}
async function deleteTempImages(paths) {
    await Promise.all(paths.map(p => promises_1.default.unlink(p).catch(() => { })));
}
//# sourceMappingURL=image.js.map