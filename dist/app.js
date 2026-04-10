"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const config_js_1 = require("./config.js");
const loggemiddleware_js_1 = require("./middleware/loggemiddleware.js");
const auth_router_js_1 = require("./routes/auth.router.js");
const seller_router_js_1 = require("./routes/seller.router.js");
// import { adminRouter } from './routers/admin.router.js';
const user_router_js_1 = require("./routes/user.router.js");
const openapi_js_1 = require("./docs/openapi.js");
const apperror_js_1 = require("./errors/apperror.js");
const category_router_js_1 = require("./routes/category.router.js");
const product_router_js_1 = require("./routes/product.router.js");
const follow_router_js_1 = require("./routes/follow.router.js");
const report_router_js_1 = require("./routes/report.router.js");
const save_product_router_js_1 = require("./routes/save_product.router.js");
const review_router_js_1 = require("./routes/review.router.js");
const shop_router_js_1 = require("./routes/shop.router.js");
const enggagement_router_js_1 = require("./routes/enggagement.router.js");
const Telegram_webhook_js_1 = require("./lib/Telegram_webhook.js");
exports.app = (0, express_1.default)();
if (config_js_1.config.isdev) {
    exports.app.use((0, cors_1.default)({
        origin: (_origin, callback) => callback(null, true), // Allow all origins
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }));
}
else {
    // production CORS settings
    //   app.use(cors({
    //   origin: ["https://teff-store.com"], // only your deployed frontend
    //   credentials: true,
    // }));Nn
    exports.app.use((0, cors_1.default)({
        origin: (_origin, callback) => {
            callback(null, true); // allow all origins
        },
        credentials: true,
    }));
}
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(loggemiddleware_js_1.requestLogger);
exports.app.use(express_1.default.json());
exports.app.get('/health', (req, res) => res.json({ ok: true }));
exports.app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapi_js_1.openApiSpec));
exports.app.use('/auth', auth_router_js_1.authRouter);
exports.app.use('/api/', user_router_js_1.userRouter);
exports.app.use('/api/', seller_router_js_1.sellerRouter);
exports.app.use('/api/', category_router_js_1.categoryRouter);
exports.app.use('/api/', product_router_js_1.productRouter);
exports.app.use('/api/follow/', follow_router_js_1.followRouter);
exports.app.use('/api/report/', report_router_js_1.reportRouter);
exports.app.use('/api/save_product/', save_product_router_js_1.saveProductRouter);
exports.app.use('/api/review/', review_router_js_1.reviewRouter);
exports.app.use('/api/shop/', shop_router_js_1.shopRouter);
exports.app.use('/api/engagement/', enggagement_router_js_1.enggagementRouter);
exports.app.use('/', Telegram_webhook_js_1.botRouter);
// app.use('/admin', adminRouter);
exports.app.use(apperror_js_1.errorHandler);
//# sourceMappingURL=app.js.map