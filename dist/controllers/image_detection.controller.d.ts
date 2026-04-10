export declare function scoreImage(path: string, userId: string): Promise<{
    score: number;
    status: "APPROVED" | "REVIEW" | "REJECTED";
    reasons: string[];
    hash: string;
    make: string | undefined;
    model: string | undefined;
}>;
//# sourceMappingURL=image_detection.controller.d.ts.map