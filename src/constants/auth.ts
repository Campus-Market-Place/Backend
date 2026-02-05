export const Roles = {
  USER: 'USER',
  SELLER: 'SELLER',
} as const;

export const SellerStatuses = {
  NONE: 'NONE',
  APPROVED: 'APPROVED',
  SUSPENDED: 'SUSPENDED',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
export type SellerStatus = (typeof SellerStatuses)[keyof typeof SellerStatuses];
