import { ZodSchema } from 'zod';
import { ValidationError } from '../errors/apperror.js';

export const validateBody = (schema: ZodSchema) => {
  return (req: any, _res: any, next: any) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
      throw new ValidationError(message);
    }
    req.body = result.data;
    next();
  };
};
