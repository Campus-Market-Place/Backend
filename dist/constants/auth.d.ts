export declare const Roles: {
    readonly USER: "USER";
    readonly SELLER: "SELLER";
    readonly ADMIN: "ADMIN";
};
export declare const SellerStatuses: {
    readonly NONE: "NONE";
    readonly APPROVED: "APPROVED";
    readonly SUSPENDED: "SUSPENDED";
    readonly WARNING: "WARNING";
};
export type Role = (typeof Roles)[keyof typeof Roles];
export type SellerStatus = (typeof SellerStatuses)[keyof typeof SellerStatuses];
//# sourceMappingURL=auth.d.ts.map