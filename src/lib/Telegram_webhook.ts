import { Router } from 'express';
import express from "express";
import { Telegraf } from "telegraf";


export const botRouter = Router();



const bot = new Telegraf(process.env.BOT_TOKEN!);

botRouter.post("/telegram/webhook", async (req, res) => {
  await bot.handleUpdate(req.body);
  res.sendStatus(200);
});





