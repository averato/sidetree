"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ErrorCode_1 = require("../../../lib/bitcoin/ErrorCode");
const JasmineSidetreeErrorValidator_1 = require("../../JasmineSidetreeErrorValidator");
const LockIdentifierSerializer_1 = require("../../../lib/bitcoin/lock/LockIdentifierSerializer");
const base64url_1 = require("base64url");
describe('LockIdentifierSerializer', () => {
    describe('serialize', () => {
        it('should serialize and deserialize it correctly.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const identifier = {
                transactionId: 'some transaction id',
                redeemScriptAsHex: 'redeem script -- input'
            };
            const serialized = LockIdentifierSerializer_1.default.serialize(identifier);
            expect(serialized).toBeDefined();
            const deserializedObj = LockIdentifierSerializer_1.default.deserialize(serialized);
            expect(deserializedObj).toEqual(identifier);
        }));
    });
    describe('deserialize', () => {
        it('should throw if the input is not delimited correctly.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const delimiter = LockIdentifierSerializer_1.default['delimiter'];
            const incorrectInput = `value1${delimiter}value2${delimiter}value3`;
            const incorrectInputEncoded = base64url_1.default.encode(incorrectInput);
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => { LockIdentifierSerializer_1.default.deserialize(incorrectInputEncoded); }, ErrorCode_1.default.LockIdentifierIncorrectFormat);
        }));
    });
});
//# sourceMappingURL=LockIdentifierSerializer.spec.js.map