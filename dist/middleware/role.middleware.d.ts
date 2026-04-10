import { NextFunction, Request, Response } from 'express';
export declare const requireRole: (...roles: string[]) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireAdmin: () => (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireActiveSeller: () => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=role.middleware.d.ts.map