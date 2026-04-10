"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTelegramMessage = exports.botRouter = void 0;
const express_1 = require("express");
const telegraf_1 = require("telegraf");
const axios_1 = __importDefault(require("axios"));
exports.botRouter = (0, express_1.Router)();
const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const sendTelegramMessage = async (chatId, text) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios_1.default.post(url, {
        chat_id: chatId,
        text,
        parse_mode: "HTML", // optional: for bold, links, etc.
    });
};
exports.sendTelegramMessage = sendTelegramMessage;
const bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
exports.botRouter.post("/telegram/webhook", async (req, res) => {
    await bot.handleUpdate(req.body);
    res.sendStatus(200);
});
//# sourceMappingURL=Telegram_webhook.js.map