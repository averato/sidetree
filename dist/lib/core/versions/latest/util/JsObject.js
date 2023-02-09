"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JsObject {
    static deepCopyObject(input) {
        if (typeof input !== 'object') {
            return input;
        }
        const deepCopy = Array.isArray(input) ? [] : {};
        for (const key in input) {
            const value = input[key];
            deepCopy[key] = JsObject.deepCopyObject(value);
        }
        return deepCopy;
    }
    static clearObject(input) {
        for (const key in input) {
            delete input[key];
        }
    }
}
exports.default = JsObject;
//# sourceMappingURL=JsObject.js.map