"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorCode_1 = require("./ErrorCode");
const ProtocolParameters_1 = require("./ProtocolParameters");
const SidetreeError_1 = require("../../../common/SidetreeError");
class FeeManager {
    static computeMinimumTransactionFee(normalizedFee, numberOfOperations) {
        if (numberOfOperations <= 0) {
            throw new SidetreeError_1.default(ErrorCode_1.default.OperationCountLessThanZero, `Fee cannot be calculated for the given number of operations: ${numberOfOperations}`);
        }
        const feePerOperation = normalizedFee * ProtocolParameters_1.default.normalizedFeeToPerOperationFeeMultiplier;
        const feeForAllOperations = feePerOperation * numberOfOperations;
        const transactionFee = Math.max(feeForAllOperations, normalizedFee);
        return transactionFee;
    }
    static verifyTransactionFeeAndThrowOnError(transactionFeePaid, numberOfOperations, normalizedFee) {
        if (numberOfOperations <= 0) {
            throw new SidetreeError_1.default(ErrorCode_1.default.OperationCountLessThanZero, `The number of operations: ${numberOfOperations} must be greater than 0`);
        }
        if (transactionFeePaid < normalizedFee) {
            throw new SidetreeError_1.default(ErrorCode_1.default.TransactionFeePaidLessThanNormalizedFee, `The actual fee paid: ${transactionFeePaid} should be greater than or equal to the normalized fee: ${normalizedFee}`);
        }
        const actualFeePerOperation = transactionFeePaid / numberOfOperations;
        const expectedFeePerOperation = normalizedFee * ProtocolParameters_1.default.normalizedFeeToPerOperationFeeMultiplier;
        if (actualFeePerOperation < expectedFeePerOperation) {
            throw new SidetreeError_1.default(ErrorCode_1.default.TransactionFeePaidInvalid, `The actual fee paid: ${transactionFeePaid} per number of operations: ${numberOfOperations} should be at least ${expectedFeePerOperation}.`);
        }
    }
}
exports.default = FeeManager;
//# sourceMappingURL=FeeManager.js.map