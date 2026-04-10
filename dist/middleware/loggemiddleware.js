"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const node_crypto_1 = require("node:crypto");
const logger_1 = require("../lib/logger");
function requestLogger(req, res, next) {
    const requestId = req.headers['x-request-id'] ?? (0, node_crypto_1.randomUUID)();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    const start = Date.now();
    res.on('finish', () => {
        logger_1.logger.info({
            requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - start,
            userId: req.user?.id,
        });
    });
    next();
}
//# sourceMappingURL=loggemiddleware.js.map