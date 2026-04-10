"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShopStatistics = void 0;
const prisma_js_1 = require("../lib/prisma.js");
const wrapper_js_1 = require("../middleware/wrapper.js");
const apperror_js_1 = require("../errors/apperror.js");
const logger_js_1 = require("../lib/logger.js");
const startOfDay = (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};
// end of day after 12 hr
const endOfDay = (date) => {
    const result = new Date(date);
    result.setHours(12, 59, 59, 999);
    return result;
};
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
const startOfWeek = (date) => {
    const result = startOfDay(date);
    const day = result.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    return addDays(result, mondayOffset);
};
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const startOfYear = (date) => new Date(date.getFullYear(), 0, 1);
const normalizeTimeFrame = (value) => {
    if (!value)
        return "day";
    const normalized = value.toLowerCase();
    if (normalized === "day")
        return "day";
    if (normalized === "week" || normalized === "wee")
        return "week";
    if (normalized === "month")
        return "month";
    if (normalized === "year")
        return "year";
    throw new apperror_js_1.ConflictError("Invalid timeFrame. Use day, week, month, or year");
};
const getTimeWindow = (timeFrame, now) => {
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
const calculatePercentChange = (current, previous) => {
    if (previous === 0 && current === 0)
        return 0;
    if (previous === 0)
        return 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
};
const getRangeMetrics = async (shopId, start, end) => {
    const [totals, latestSnapshot] = await Promise.all([
        prisma_js_1.prisma.shopAnalyticsDaily.aggregate({
            where: {
                shopId,
                date: {
                    gte: start,
                    lt: end,
                },
            },
            _sum: {
                views: true,
                contacts: true,
                socialChecks: true,
                uniqueFollower: true,
            },
        }),
        prisma_js_1.prisma.shopAnalyticsDaily.findFirst({
            where: {
                shopId,
                date: {
                    gte: start,
                    lt: end,
                },
            },
            orderBy: { date: "desc" },
            select: {
                followers: true,
            },
        }),
    ]);
    return {
        views: totals._sum.views ?? 0,
        contacts: totals._sum.contacts ?? 0,
        socialMediaClicks: totals._sum.socialChecks ?? 0,
        newFollowers: totals._sum.uniqueFollower ?? 0,
        totalFollowers: latestSnapshot?.followers ?? 0,
    };
};
exports.getShopStatistics = (0, wrapper_js_1.catchAsync)(async (req, res) => {
    const shopId = req.shop?.id;
    const { timeFrame } = req.query;
    if (!shopId || Array.isArray(shopId)) {
        throw new apperror_js_1.ConflictError("Shop id is required and must be a string");
    }
    const selectedTimeFrame = normalizeTimeFrame(timeFrame);
    const now = new Date();
    const { currentStart, currentEnd, previousStart, previousEnd } = getTimeWindow(selectedTimeFrame, now);
    const [currentMetrics, previousMetrics] = await Promise.all([
        getRangeMetrics(shopId, currentStart, currentEnd),
        getRangeMetrics(shopId, previousStart, previousEnd),
    ]);
    const views = currentMetrics.views;
    const contacts = currentMetrics.contacts;
    const socialMediaClicks = currentMetrics.socialMediaClicks;
    const newFollowers = currentMetrics.newFollowers;
    const totalFollowers = currentMetrics.totalFollowers;
    const previousViews = previousMetrics.views;
    const previousContacts = previousMetrics.contacts;
    const previousSocialMediaClicks = previousMetrics.socialMediaClicks;
    const previousNewFollowers = previousMetrics.newFollowers;
    const previousTotalFollowers = previousMetrics.totalFollowers;
    const ctr = views > 0 ? Number((((contacts + socialMediaClicks) / views) * 100).toFixed(2)) : 0;
    const followersVsViewsRatio = views > 0 ? Number(((newFollowers / views) * 100).toFixed(2)) : 0;
    const comparisons = {
        viewsPercent: calculatePercentChange(views, previousViews),
        contactsPercent: calculatePercentChange(contacts, previousContacts),
        socialMediaClicksPercent: calculatePercentChange(socialMediaClicks, previousSocialMediaClicks),
        newFollowersPercent: calculatePercentChange(newFollowers, previousNewFollowers),
        totalFollowersPercent: calculatePercentChange(totalFollowers, previousTotalFollowers),
    };
    logger_js_1.logger.info({
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
                totalFollowers,
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
});
//# sourceMappingURL=statstics.controller.js.map