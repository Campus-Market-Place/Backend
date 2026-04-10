import { z } from 'zod';
declare enum ReportReason {
    InappropriateContent = "Inappropriate Content",
    SpamOrScam = "Spam or Scam",
    HarassmentOrBullying = "Harassment or Bullying",
    IntellectualPropertyViolation = "Intellectual Property Violation",
    Other = "Other"
}
export declare const ReportSchema: z.ZodObject<{
    reason: z.ZodEnum<typeof ReportReason>;
}, z.core.$strip>;
export {};
//# sourceMappingURL=report.validation.d.ts.map