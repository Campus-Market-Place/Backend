import { Router } from 'express';
import express from "express";
import { Telegraf } from "telegraf";
import axios from "axios";
import { link } from 'fs';

export const botRouter = Router();
const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;

export const sendTelegramMessage = async (chatId: string, text: string) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  await axios.post(url, {
    chat_id: chatId,
    text,
    parse_mode: "HTML", // optional: for bold, links, etc.

  });
};


const bot = new Telegraf(process.env.BOT_TOKEN!);

botRouter.post("/telegram/webhook", async (req, res) => {
  await bot.handleUpdate(req.body);
  res.sendStatus(200);
});










