"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ErrorCode_1 = require("../../lib/core/versions/latest/ErrorCode");
const FeeManager_1 = require("../../lib/core/versions/latest/FeeManager");
const JasmineSidetreeErrorValidator_1 = require("../JasmineSidetreeErrorValidator");
const ProtocolParameters_1 = require("../../lib/core/versions/latest/ProtocolParameters");
describe('FeeManager', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    beforeAll(() => {
        ProtocolParameters_1.default.maxNumberOfOperationsForNoValueTimeLock = 100;
        ProtocolParameters_1.default.normalizedFeeToPerOperationFeeMultiplier = 0.001;
    });
    describe('computeMinimumTransactionFee', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should calculate fee correctly.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const normalizedFee = 1000;
            const numberOfOperations = 1000;
            const fee = FeeManager_1.default.computeMinimumTransactionFee(normalizedFee, numberOfOperations);
            expect(fee).toEqual(1000);
        }));
        it('should return at least the normalized fee if the calculated fee is lower', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const fee = FeeManager_1.default.computeMinimumTransactionFee(100, 1);
            expect(fee).toEqual(100);
        }));
        it('should fail if the number of operations is <= 0', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => FeeManager_1.default.computeMinimumTransactionFee(100, 0), ErrorCode_1.default.OperationCountLessThanZero);
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => FeeManager_1.default.computeMinimumTransactionFee(100, -1), ErrorCode_1.default.OperationCountLessThanZero);
        }));
    }));
    describe('verifyTransactionFeeAndThrowOnError', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should not throw if the fee paid is at least the expected fee', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            try {
                const feeToPay = FeeManager_1.default.computeMinimumTransactionFee(100, 100);
                FeeManager_1.default.verifyTransactionFeeAndThrowOnError(feeToPay, 100, 100);
            }
            catch (e) {
                fail();
            }
        }));
        it('should not throw if the fee paid is at least the expected fee (0% markup)', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            try {
                const feeToPay = FeeManager_1.default.computeMinimumTransactionFee(100, 100);
                FeeManager_1.default.verifyTransactionFeeAndThrowOnError(feeToPay, 100, 100);
            }
            catch (e) {
                fail();
            }
        }));
        it('should throw if the fee paid is less than the expected fee', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const feePaid = 2000;
            const numberOfOperations = 10000;
            const normalizedFee = 1000;
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => FeeManager_1.default.verifyTransactionFeeAndThrowOnError(feePaid, numberOfOperations, normalizedFee), ErrorCode_1.default.TransactionFeePaidInvalid);
        }));
        it('should throw if the fee paid is less than the normalized fee', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => FeeManager_1.default.verifyTransactionFeeAndThrowOnError(99, 10, 100), ErrorCode_1.default.TransactionFeePaidLessThanNormalizedFee);
        }));
        it('should throw if the number of operations are <= 0', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => FeeManager_1.default.verifyTransactionFeeAndThrowOnError(101, 0, 10), ErrorCode_1.default.OperationCountLessThanZero);
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => FeeManager_1.default.verifyTransactionFeeAndThrowOnError(101, -1, 10), ErrorCode_1.default.OperationCountLessThanZero);
        }));
    }));
}));
//# sourceMappingURL=FeeManager.spec.js.map