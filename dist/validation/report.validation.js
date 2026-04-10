"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportSchema = void 0;
const zod_1 = require("zod");
var ReportReason;
(function (ReportReason) {
    ReportReason["InappropriateContent"] = "Inappropriate Content";
    ReportReason["SpamOrScam"] = "Spam or Scam";
    ReportReason["HarassmentOrBullying"] = "Harassment or Bullying";
    ReportReason["IntellectualPropertyViolation"] = "Intellectual Property Violation";
    ReportReason["Other"] = "Other";
})(ReportReason || (ReportReason = {}));
exports.ReportSchema = zod_1.z.object({
    reason: zod_1.z.nativeEnum(ReportReason)
        .refine((val) => Object.values(ReportReason).includes(val), {
        message: 'Invalid report reason',
    }),
});
//# sourceMappingURL=report.validation.js.map