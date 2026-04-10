"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = require("../config.js");
function signJwt(payload) {
    const options = {};
    if (config_js_1.config.jwtExpiresIn !== undefined) {
        options.expiresIn = config_js_1.config.jwtExpiresIn;
    }
    // const options: SignOptions = {
    //   expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
    // };
    return jsonwebtoken_1.default.sign(payload, config_js_1.config.jwtSecret, options);
}
function verifyJwt(token) {
    return jsonwebtoken_1.default.verify(token, config_js_1.config.jwtSecret);
}
//# sourceMappingURL=jwt.js.map