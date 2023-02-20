"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SidetreeError extends Error {
    constructor(code, message) {
        super(message ? message : code);
        this.code = code;
        Object.setPrototypeOf(this, new.target.prototype);
    }
    static createFromError(code, err) {
        return new SidetreeError(code, err.message);
    }
    static stringify(error) {
        return JSON.stringify(error, Object.getOwnPropertyNames(error));
    }
}
exports.default = SidetreeError;
//# sourceMappingURL=SidetreeError.js.map