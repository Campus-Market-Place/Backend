"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_js_1 = require("./config.js");
const app_js_1 = require("./app.js");
async function main() {
    // start server
    const port = config_js_1.config.port;
    app_js_1.app.listen(port, () => {
        console.log(`🚀 Server running on http://localhost:${port}`);
    });
}
main().catch((e) => {
    console.error("Failed to start server", e);
    process.exit(1);
});
//# sourceMappingURL=server.js.map