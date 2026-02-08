import { z } from 'zod';


enum ReportReason {
    InappropriateContent = 'Inappropriate Content',
    SpamOrScam = 'Spam or Scam',
    HarassmentOrBullying = 'Harassment or Bullying',
    IntellectualPropertyViolation = 'Intellectual Property Violation',
    Other = 'Other',
}

export const ReportSchema = z.object({
    reason: z.nativeEnum(ReportReason)
        .refine((val) => Object.values(ReportReason).includes(val), {
            message: 'Invalid report reason',
        }),
});