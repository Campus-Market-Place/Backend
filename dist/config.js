"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
dotenv_1.default.config();
exports.config = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    databaseUrl: process.env.DATABASE_URL ?? '',
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    isdev: process.env.NODE_ENV !== 'production',
    adminUsernames: (process.env.ADMIN_USERNAMES ?? '')
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    Bot_token: process.env.BOT_TOKEN || '',
};
if (!exports.config.databaseUrl) {
    // eslint-disable-next-line no-console
    console.warn('DATABASE_URL is not set. Set it in your environment.');
}
cloudinary_1.v2.config({
    cloud_name: exports.config.CLOUDINARY_CLOUD_NAME,
    api_key: exports.config.CLOUDINARY_API_KEY,
    api_secret: exports.config.CLOUDINARY_API_SECRET || '',
});
//# sourceMappingURL=config.js.map