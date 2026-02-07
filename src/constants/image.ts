const ImageStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
} as const;

export type ImageStatus = typeof ImageStatus[keyof typeof ImageStatus];

export const VerificationLevel = {
    UNVERIFIED: "UNVERIFIED",
    BASIC: "BASIC",
    VERIFIED: "VERIFIED",
} as const;

export type VerificationLevel = typeof VerificationLevel[keyof typeof VerificationLevel];