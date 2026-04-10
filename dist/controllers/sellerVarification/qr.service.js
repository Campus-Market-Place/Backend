"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeQR = decodeQR;
const jsqr_1 = __importDefault(require("jsqr"));
const canvas_1 = require("canvas");
const logger_1 = require("../../lib/logger");
async function decodeQR(image) {
    const img = await (0, canvas_1.loadImage)(image);
    const canvas = (0, canvas_1.createCanvas)(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const qr = (0, jsqr_1.default)(imageData.data, img.width, img.height);
    logger_1.logger.info(`Decoded QR code: ${qr ? qr.data : 'No QR code found'}`);
    return qr?.data || null;
}
//# sourceMappingURL=qr.service.js.map