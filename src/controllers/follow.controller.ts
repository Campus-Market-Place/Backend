import { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { catchAsync } from "../middleware/wrapper.js";
import { NotFoundError, ConflictError } from "../errors/apperror.js";
import { logger } from "../lib/logger.js";
import { sendTelegramMessage } from "../lib/Telegram_webhook.js";


export const toggleFollowShop = catchAsync(
  async (req: Request, res: Response) => {


    const shopId = req.shop?.id;
    if (!shopId || Array.isArray(shopId)) {
      throw new ConflictError("Shop id is required and must be a string");
    }

    

    const userId = req.user?.id;
    if (!userId) throw new NotFoundError("User context missing");


    const today = new Date();
    today.setHours(0, 0, 0, 0)


    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const existingFollow = await tx.follow.findUnique({
          where: {
            userId_shopId: { userId, shopId },
          },
        });

        let action: "followed" | "unfollowed";
        let isfirst = false;

        // case1 - first time follow
        if (!existingFollow) {
          await tx.follow.create({
            data: { userId, shopId },
          });

          action = "followed";
          isfirst = true;
        }
        // case2 - refollow after unfollowing
        else if (!existingFollow.isActive) {
          await tx.follow.update({
            where: { id: existingFollow.id },
            data: { isActive: true },
          });

          action = "followed";
        }
        // case3 - unfollowing
        else {
          await tx.follow.update({
            where: { id: existingFollow.id },
            data: { isActive: false },
          });

          action = "unfollowed";
        }

        // 🔹 Update shop followers count
        await tx.shop.update({
          where: { id: shopId },
          data: { followersCount: (action === "followed") ? { increment: 1 } : { decrement: 1 } },
        });

        // 🔹 Update daily analytics
        const updateData: any = {
          followers: (action === "followed") ? { increment: 1 } : { decrement: 1 },
        };



        if (isfirst) {
          updateData.uniqueFollower = { increment: 1 };
        }

        await tx.shopAnalyticsDaily.upsert({
          where: {
            shopId_date: {
              shopId,
              date: today,
            },
          },
          update: updateData,
          create: {
            shopId,
            date: today,
            followers: action === "followed" ? 1 : 0,
            uniqueFollower: isfirst ? 1 : 0,
          },
        });

        return { action };
      }
    );


    if (result.action === "followed") {
      // Send notification to shop owner
      const shop = await prisma.shop.findUnique({
        where: { id: shopId },
        include: {
          seller: {
            include: { user: { select: { telegramchatId: true } } }
          }
        },
      });

      const ownerChatId = shop?.seller?.user?.telegramchatId;
      const isValidChatId = typeof ownerChatId === "string" && /^-?\d+$/.test(ownerChatId);

      if (shop && isValidChatId) {
        try {
          await sendTelegramMessage(ownerChatId, 
  `🎉 Your shop "${shop.shopName}" has a new follower! \n
👤 User: ${req.user?.username || "Anonymous"} \n
📈 Total Followers: ${shop.followersCount} \n
🔥 Keep posting to attract more customers! 
`);
        } catch (error) {
          logger.warn({
            event: "follow_notification_failed",
            requestId: req.requestId,
            shopId,
            ownerChatId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      } else if (ownerChatId) {
        logger.warn({
          event: "follow_notification_skipped_invalid_chat_id",
          requestId: req.requestId,
          shopId,
          ownerChatId,
        });
      }
    }



    logger.info({
      event:
        result.action === "followed"
          ? "shop_followed"
          : "shop_unfollowed",
      requestId: req.requestId,
      userId,
      shopId,
    });

    return res.status(200).json({
      message:
        result.action === "followed"
          ? "Shop followed successfully"
          : "Shop unfollowed successfully",

    });
  }
);



// get followers of a shop
export const getShopFollowers = catchAsync(async (req: Request, res: Response) => {
  const shopId = req.shop?.id;

  if (!shopId || Array.isArray(shopId)) {
    throw new ConflictError('Shop id is required and must be a string');
  }

  const followers = await prisma.follow.findMany({
    where: { shopId, isActive: true },
    include: {
      user: {
        select: {
          username: true,
          telegramId: true,
          telegramchatId: true,
        },
      },
    },
  });

  res.status(200).json({ data: { followers }, message: "Shop followers fetched successfully" });
});