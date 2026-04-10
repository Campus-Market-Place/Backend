"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractText = extractText;
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const image_js_1 = require("../../lib/image.js");
async function extractText(image) {
    const buffer = await (0, image_js_1.preprocessImage)(image);
    const result = await tesseract_js_1.default.recognize(buffer, "eng", { logger: () => { } });
    return result.data.text;
}
//# sourceMappingURL=ocr.service.js.map