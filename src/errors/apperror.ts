import { Request, Response, NextFunction } from "express";

// Base AppError
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture the stack trace correctly
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific Errors
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database error") {
    super(message, 500, false);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

// ===== Express Error Handler Middleware =====
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let customError = err;

  // If not an instance of AppError, wrap it in internal error
  if (!(err instanceof AppError)) {
    customError = new AppError("Internal Server Error", 500, false);
  }

  const { statusCode, message, isOperational } = customError as AppError;

  // Log non-operational errors (programmer errors)
  if (!isOperational) {
    console.error("💥 Unexpected Error:", err);
  }

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: isOperational ? message : "Something went wrong",
    // Optional: include stack trace only in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
