export const Roles = {
  USER: 'USER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
} as const;

export const SellerStatuses = {
  NONE: 'NONE',
  APPROVED: 'APPROVED',
  SUSPENDED: 'SUSPENDED',
  WARNING: 'WARNING',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
export type SellerStatus = (typeof SellerStatuses)[keyof typeof SellerStatuses];
