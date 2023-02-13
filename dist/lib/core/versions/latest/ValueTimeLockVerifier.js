'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const ErrorCode_1 = require('./ErrorCode');
const ProtocolParameters_1 = require('./ProtocolParameters');
const SidetreeError_1 = require('../../../common/SidetreeError');
class ValueTimeLockVerifier {
  static calculateMaxNumberOfOperationsAllowed (valueTimeLock, versionMetadataFetcher) {
    if (valueTimeLock === undefined) {
      return ProtocolParameters_1.default.maxNumberOfOperationsForNoValueTimeLock;
    }
    const versionMetadata = versionMetadataFetcher.getVersionMetadata(valueTimeLock.lockTransactionTime);
    const normalizedFeeToPerOperationFeeMultiplier = versionMetadata.normalizedFeeToPerOperationFeeMultiplier;
    const valueTimeLockAmountMultiplier = versionMetadata.valueTimeLockAmountMultiplier;
    const feePerOperation = valueTimeLock.normalizedFee * normalizedFeeToPerOperationFeeMultiplier;
    const numberOfOpsAllowed = valueTimeLock.amountLocked / (feePerOperation * valueTimeLockAmountMultiplier);
    const numberOfOpsAllowedInt = Math.floor(numberOfOpsAllowed);
    return Math.max(numberOfOpsAllowedInt, ProtocolParameters_1.default.maxNumberOfOperationsForNoValueTimeLock);
  }

  static verifyLockAmountAndThrowOnError (valueTimeLock, numberOfOperations, sidetreeTransactionTime, sidetreeTransactionWriter, versionMetadataFetcher) {
    if (numberOfOperations <= ProtocolParameters_1.default.maxNumberOfOperationsForNoValueTimeLock) {
      return;
    }
    if (valueTimeLock) {
      if (valueTimeLock.owner !== sidetreeTransactionWriter) {
        throw new SidetreeError_1.default(ErrorCode_1.default.ValueTimeLockVerifierTransactionWriterLockOwnerMismatch, `Sidetree transaction writer: ${sidetreeTransactionWriter} - Lock owner: ${valueTimeLock.owner}`);
      }
      if (sidetreeTransactionTime < valueTimeLock.lockTransactionTime ||
                sidetreeTransactionTime >= valueTimeLock.unlockTransactionTime) {
        throw new SidetreeError_1.default(ErrorCode_1.default.ValueTimeLockVerifierTransactionTimeOutsideLockRange, `Sidetree transaction block: ${sidetreeTransactionTime}; lock start time: ${valueTimeLock.lockTransactionTime}; unlock time: ${valueTimeLock.unlockTransactionTime}`);
      }
    }
    const maxNumberOfOpsAllowed = this.calculateMaxNumberOfOperationsAllowed(valueTimeLock, versionMetadataFetcher);
    if (numberOfOperations > maxNumberOfOpsAllowed) {
      throw new SidetreeError_1.default(ErrorCode_1.default.ValueTimeLockVerifierInvalidNumberOfOperations, `Max number of ops allowed: ${maxNumberOfOpsAllowed}; actual number of ops: ${numberOfOperations}`);
    }
  }
}
exports.default = ValueTimeLockVerifier;
// # sourceMappingURL=ValueTimeLockVerifier.js.map
