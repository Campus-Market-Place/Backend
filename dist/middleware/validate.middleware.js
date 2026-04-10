"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const apperror_js_1 = require("../errors/apperror.js");
const validateBody = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const message = result.error.issues
                .map((err) => `${err.path.join('.')}: ${err.message}`)
                .join('; ');
            throw new apperror_js_1.ValidationError(message);
        }
        req.body = result.data;
        next();
    };
};
exports.validateBody = validateBody;
//# sourceMappingURL=validate.middleware.js.map