"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TypedError extends Error {
    constructor(type) {
        super(type);
        this.type = type;
    }
}
exports.default = TypedError;
//# sourceMappingURL=Errors.js.map