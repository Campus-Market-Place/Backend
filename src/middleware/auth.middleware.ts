import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors/apperror.js';
import { prisma } from '../lib/prisma.js';
import { verifyJwt } from '../lib/jwt.js';

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.replace('Bearer ', '').trim();
  let payload;
  try {
    payload = verifyJwt(token);
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user || user.deletedAt) {
    throw new ForbiddenError('User not found or deactivated');
  }

  req.user = {
    id: user.id,
    username: user.username,
    role: user.role,
    sellerStatus: user.sellerStatus,
  };

  next();
}
