"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorCode_1 = require("../ErrorCode");
const SidetreeError_1 = require("../../common/SidetreeError");
const base64url_1 = require("base64url");
class LockIdentifierSerializer {
    static serialize(lockIdentifier) {
        const delim = LockIdentifierSerializer.delimiter;
        const concatenatedData = `${lockIdentifier.transactionId}${delim}${lockIdentifier.redeemScriptAsHex}`;
        return base64url_1.default.encode(concatenatedData);
    }
    static deserialize(serialized) {
        const decodedString = base64url_1.default.decode(serialized);
        const splitDecodedString = decodedString.split(LockIdentifierSerializer.delimiter);
        if (splitDecodedString.length !== 2) {
            throw new SidetreeError_1.default(ErrorCode_1.default.LockIdentifierIncorrectFormat, `Input: ${serialized}`);
        }
        return {
            transactionId: splitDecodedString[0],
            redeemScriptAsHex: splitDecodedString[1]
        };
    }
}
exports.default = LockIdentifierSerializer;
LockIdentifierSerializer.delimiter = '.';
//# sourceMappingURL=LockIdentifierSerializer.js.map