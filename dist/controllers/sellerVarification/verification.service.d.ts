export declare function verifySeller(userId: string, frontImage: Buffer, backImage: Buffer): Promise<{
    studentId: string;
    score: number;
    level: "FLAGGED" | "BASIC" | "VERIFIED";
    frontHash: string;
    backHash: string;
}>;
//# sourceMappingURL=verification.service.d.ts.map