"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canonicalize = require('canonicalize');
class JsonCanonicalizer {
    static canonicalizeAsBuffer(content) {
        const canonicalizedString = canonicalize(content);
        const contentBuffer = Buffer.from(canonicalizedString);
        return contentBuffer;
    }
}
exports.default = JsonCanonicalizer;
//# sourceMappingURL=JsonCanonicalizer.js.map