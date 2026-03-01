import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { catchAsync } from "../middleware/wrapper.js";
import { ConflictError } from "../errors/apperror.js";
import { logger } from "../lib/logger.js";

type TimeFrame = "day" | "week" | "month" | "year";

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

// end of day after 12 hr
const endOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(12, 59, 59, 999);
  return result;
}



const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfWeek = (date: Date) => {
  const result = startOfDay(date);
  const day = result.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDays(result, mondayOffset);
};




const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);



const startOfYear = (date: Date) => new Date(date.getFullYear(), 0, 1);


const normalizeTimeFrame = (value?: string): TimeFrame => {
  if (!value) return "day";

  const normalized = value.toLowerCase();
  if (normalized === "day") return "day";
  if (normalized === "week" || normalized === "wee") return "week";
  if (normalized === "month") return "month";
  if (normalized === "year") return "year";

  throw new ConflictError("Invalid timeFrame. Use day, week, month, or year");
};

const getTimeWindow = (timeFrame: TimeFrame, now: Date) => {
  switch (timeFrame) {
    case "day": {
      const currentStart = startOfDay(now);
      const currentEnd = addDays(currentStart, 1);
      const previousStart = addDays(currentStart, -1);
      const previousEnd = currentStart;
      return { currentStart, currentEnd, previousStart, previousEnd };
    }
    case "week": {
      const currentStart = startOfWeek(now);
      const currentEnd = addDays(currentStart, 7);
      const previousStart = addDays(currentStart, -7);
      const previousEnd = currentStart;
      return { currentStart, currentEnd, previousStart, previousEnd };
    }
    case "month": {
      const currentStart = startOfMonth(now);
      const currentEnd = new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, 1);
      const previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, 1);
      const previousEnd = currentStart;
      return { currentStart, currentEnd, previousStart, previousEnd };
    }
    case "year": {
      const currentStart = startOfYear(now);
      const currentEnd = new Date(currentStart.getFullYear() + 1, 0, 1);
      const previousStart = new Date(currentStart.getFullYear() - 1, 0, 1);
      const previousEnd = currentStart;
      return { currentStart, currentEnd, previousStart, previousEnd };
    }
  }
};

// get end of a day , end of month ,end of week, end of year


const calculatePercentChange = (current: number, previous: number) => {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return null;
  return Number((((current - previous) / previous) * 100).toFixed(2));
};

export const getShopStatistics = catchAsync(
  async (req: Request, res: Response) => {
    const shopId = req.shop?.id;

    const { timeFrame } = req.query as { timeFrame?: string };

    if (!shopId || Array.isArray(shopId)) {
      throw new ConflictError("Shop id is required and must be a string");
    }

    const selectedTimeFrame = normalizeTimeFrame(timeFrame);
    const now = new Date();
    const { currentStart, currentEnd, previousStart, previousEnd } = getTimeWindow(
      selectedTimeFrame,
      now
    );

    const [currentAnalytics, previousAnalytics] =
      await Promise.all([
        prisma.shopAnalyticsDaily.findFirst({
          where: {
            shopId,
            date: {
              gte: currentStart,
              lt: currentEnd,
            },
          },
          select: {
            views: true,
            contacts: true,
            socialChecks: true,
            uniqueFollower: true,
            followers: true,
            date: true,
          }
        }),
        prisma.shopAnalyticsDaily.findFirst({
          where: {
            shopId,
            date: {
              gte: previousStart,
              lt: previousEnd,
            },
          },
          select: {
            views: true,
            contacts: true,
            socialChecks: true,
            uniqueFollower: true,
            followers: true,
            date: true,
          },
        }),
      ]);

    const views = currentAnalytics?.views ?? 0;
    const contacts = currentAnalytics?.contacts ?? 0;
    const socialMediaClicks = currentAnalytics?.socialChecks ?? 0;
    const newFollowers = currentAnalytics?.uniqueFollower ?? 0;
    const totalFollowers = currentAnalytics?.followers ?? 0;

    const previousViews = previousAnalytics?.views ?? 0;
    const previousContacts = previousAnalytics?.contacts ?? 0;
    const previousSocialMediaClicks = previousAnalytics?.socialChecks ?? 0;
    const previousNewFollowers = previousAnalytics?.uniqueFollower ?? 0;
    const previousTotalFollowers = previousAnalytics?.followers ?? 0;

    const ctr = views > 0 ? Number((((contacts + socialMediaClicks) / views) * 100).toFixed(2)) : 0;
    const followersVsViewsRatio = views > 0 ? Number(((newFollowers / views) * 100).toFixed(2)) : 0;

    const comparisons = {
      viewsPercent: calculatePercentChange(views, previousViews),
      contactsPercent: calculatePercentChange(contacts, previousContacts),
      socialMediaClicksPercent: calculatePercentChange(
        socialMediaClicks,
        previousSocialMediaClicks
      ),
      newFollowersPercent: calculatePercentChange(newFollowers, previousNewFollowers),
      totalFollowersPercent: calculatePercentChange(totalFollowers, previousTotalFollowers),
    };

    logger.info({
      event: "shop_statistics_fetched",
      requestId: req.requestId,
      shopId,
      timeFrame: selectedTimeFrame,
    });


  

    res.status(200).json({
      success: true,
      data: {
        timeFrame: selectedTimeFrame,
        period: {
          currentStart,
          currentEnd,
          previousStart,
          previousEnd,
        },
        metrics: {
          views,
          contacts,
          socialMediaClicks,
          newFollowers,
          totalFollowers: currentAnalytics?.followers ?? 0,
          contactvsviewsRatio: ctr,
          followersVsViewsRatio,
        },
        trend: {
          views: comparisons.viewsPercent === null ? "neutral" : comparisons.viewsPercent > 0 ? "up" : "down",
          contacts: comparisons.contactsPercent === null ? "neutral" : comparisons.contactsPercent > 0 ? "up" : "down",
        },
        comparisons,
      },
    });
  }
);




