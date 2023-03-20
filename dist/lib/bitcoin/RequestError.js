"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Response_1 = tslib_1.__importDefault(require("../common/Response"));
class RequestError extends Error {
    get status() {
        return Response_1.default.toHttpStatus(this.responseCode);
    }
    get expose() {
        return this.code !== undefined;
    }
    constructor(responseCode, code) {
        super(code ? JSON.stringify({ code }) : undefined);
        this.responseCode = responseCode;
        this.code = code;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.default = RequestError;
//# sourceMappingURL=RequestError.js.map