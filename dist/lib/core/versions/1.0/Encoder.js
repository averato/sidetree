"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ErrorCode_1 = tslib_1.__importDefault(require("./ErrorCode"));
const SidetreeError_1 = tslib_1.__importDefault(require("../../../common/SidetreeError"));
const base64url_1 = tslib_1.__importDefault(require("base64url"));
class Encoder {
    static encode(content) {
        const encodedContent = base64url_1.default.encode(content);
        return encodedContent;
    }
    static decodeAsBuffer(encodedContent) {
        Encoder.validateBase64UrlString(encodedContent);
        const content = base64url_1.default.toBuffer(encodedContent);
        return content;
    }
    static decodeAsString(encodedContent) {
        return Encoder.decodeBase64UrlAsString(encodedContent);
    }
    static decodeBase64UrlAsString(input) {
        Encoder.validateBase64UrlString(input);
        const content = base64url_1.default.decode(input);
        return content;
    }
    static validateBase64UrlString(input) {
        if (typeof input !== 'string') {
            throw new SidetreeError_1.default(ErrorCode_1.default.EncoderValidateBase64UrlStringInputNotString, `Input '${JSON.stringify(input)}' not a string.`);
        }
        const isBase64UrlString = Encoder.isBase64UrlString(input);
        if (!isBase64UrlString) {
            throw new SidetreeError_1.default(ErrorCode_1.default.EncoderValidateBase64UrlStringInputNotBase64UrlString, `Input '${JSON.stringify(input)}' not a Base64URL string.`);
        }
    }
    static isBase64UrlString(input) {
        const isBase64UrlString = /^[A-Za-z0-9_-]+$/.test(input);
        return isBase64UrlString;
    }
}
exports.default = Encoder;
//# sourceMappingURL=Encoder.js.map