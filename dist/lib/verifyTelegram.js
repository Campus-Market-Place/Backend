"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTelegram = verifyTelegram;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("./logger");
function verifyTelegram(initData, botToken) {
    const params = new URLSearchParams(initData);
    logger_1.logger.info({
        event: 'verify_telegram_attempt',
        requestId: '', // You can pass the requestId if available
        initDataProvided: !!initData,
    });
    const hash = params.get("hash");
    params.delete("hash");
    const dataCheckArr = [];
    params.sort();
    for (const [key, value] of params.entries()) {
        dataCheckArr.push(`${key}=${value}`);
    }
    const dataCheckString = dataCheckArr.join("\n");
    const secret = crypto_1.default
        .createHash("sha256")
        .update(botToken)
        .digest();
    const hmac = crypto_1.default
        .createHmac("sha256", secret)
        .update(dataCheckString)
        .digest("hex");
    return hmac === hash;
}
//# sourceMappingURL=verifyTelegram.js.map