"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.DatabaseError = exports.ValidationError = exports.NotFoundError = exports.AppError = void 0;
const logger_js_1 = require("../lib/logger.js");
// Base AppError
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        // Capture the stack trace correctly
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Specific Errors
class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends AppError {
    constructor(message = "Validation failed") {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class DatabaseError extends AppError {
    constructor(message = "Database error") {
        super(message, 500, false);
    }
}
exports.DatabaseError = DatabaseError;
class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends AppError {
    constructor(message = "Conflict") {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
// ===== Express Error Handler Middleware =====
const errorHandler = (err, req, res, next) => {
    let customError = err;
    // If not an instance of AppError, wrap it in internal error
    const isPrismaError = typeof err === "object" &&
        err !== null &&
        "code" in err &&
        "clientVersion" in err;
    if (isPrismaError) {
        customError = new DatabaseError("Database operation failed");
    }
    else if (!(err instanceof AppError)) {
        customError = new AppError("Internal Server Error", 500, false);
    }
    const { statusCode, message, isOperational } = customError;
    // Log non-operational errors (programmer errors)
    if (!isOperational) {
        logger_js_1.logger.error({
            event: "internal_error",
            requestId: req.requestId,
            message: err.message,
            stack: err.stack,
        });
    }
    else {
        logger_js_1.logger.warn({
            event: "operational_error",
            requestId: req.requestId,
            message: err.message,
        });
    }
    res.status(statusCode).json({
        status: "error",
        statusCode,
        message: isOperational ? message : "Something went wrong",
        requestId: req.requestId,
        // Optional: include stack trace only in development
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=apperror.js.map