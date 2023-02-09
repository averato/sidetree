"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ErrorCode_1 = require("../../lib/core/versions/latest/ErrorCode");
const JasmineSidetreeErrorValidator_1 = require("../JasmineSidetreeErrorValidator");
const Operation_1 = require("../../lib/core/versions/latest/Operation");
const SidetreeError_1 = require("../../lib/common/SidetreeError");
describe('Operation', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    describe('parse()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should throw if operation of unknown type is given.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const operationOfUnknownType = {
                type: 'unknown',
                anyProperty: 'anyContent'
            };
            const operationBuffer = Buffer.from(JSON.stringify(operationOfUnknownType));
            yield expectAsync(Operation_1.default.parse(operationBuffer)).toBeRejectedWith(new SidetreeError_1.default(ErrorCode_1.default.OperationTypeUnknownOrMissing));
            done();
        }));
    }));
    describe('validateDelta', () => {
        it('should throw sidetree error if input is not an object', () => {
            const input = 'this is not an object, this is a string';
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => Operation_1.default.validateDelta(input), ErrorCode_1.default.InputValidatorInputIsNotAnObject, 'delta');
        });
    });
}));
//# sourceMappingURL=Operation.spec.js.map