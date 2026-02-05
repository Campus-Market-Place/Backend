import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { logger } from '../lib/logger';

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = (req.headers['x-request-id'] as string) ?? randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  const start = Date.now();

  res.on('finish', () => {
    logger.info({
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      userId: (req as any).user?.id,
    });
  });

  next();
}
