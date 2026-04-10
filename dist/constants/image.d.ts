declare const ImageStatus: {
    readonly PENDING: "PENDING";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
};
export type ImageStatus = typeof ImageStatus[keyof typeof ImageStatus];
export declare const VerificationLevel: {
    readonly UNVERIFIED: "UNVERIFIED";
    readonly BASIC: "BASIC";
    readonly VERIFIED: "VERIFIED";
};
export type VerificationLevel = typeof VerificationLevel[keyof typeof VerificationLevel];
export {};
//# sourceMappingURL=image.d.ts.map