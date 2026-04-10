"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = require("../lib/logger");
function errorHandler(err, req, res, _next) {
    logger_1.logger.error({
        requestId: req.requestId,
        message: err.message,
        stack: err.stack,
    });
    res.status(500).json({
        message: 'Internal server error',
        requestId: req.requestId,
    });
}
//# sourceMappingURL=errorlog.js.map