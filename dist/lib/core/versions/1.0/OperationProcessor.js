'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const CreateOperation_1 = require('./CreateOperation');
const DeactivateOperation_1 = require('./DeactivateOperation');
const DocumentComposer_1 = require('./DocumentComposer');
const Encoder_1 = require('./Encoder');
const ErrorCode_1 = require('./ErrorCode');
const JsObject_1 = require('./util/JsObject');
const JsonCanonicalizer_1 = require('./util/JsonCanonicalizer');
const Logger_1 = require('../../../common/Logger');
const Multihash_1 = require('./Multihash');
const Operation_1 = require('./Operation');
const OperationType_1 = require('../../enums/OperationType');
const RecoverOperation_1 = require('./RecoverOperation');
const SidetreeError_1 = require('../../../common/SidetreeError');
const UpdateOperation_1 = require('./UpdateOperation');
class OperationProcessor {
  apply (anchoredOperationModel, didState) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (didState === undefined && anchoredOperationModel.type !== OperationType_1.default.Create) {
        return undefined;
      }
      const previousOperationTransactionNumber = didState ? didState.lastOperationTransactionNumber : undefined;
      let appliedDidState;
      if (anchoredOperationModel.type === OperationType_1.default.Create) {
        appliedDidState = yield this.applyCreateOperation(anchoredOperationModel, didState);
      } else if (anchoredOperationModel.type === OperationType_1.default.Update) {
        appliedDidState = yield this.applyUpdateOperation(anchoredOperationModel, didState);
      } else if (anchoredOperationModel.type === OperationType_1.default.Recover) {
        appliedDidState = yield this.applyRecoverOperation(anchoredOperationModel, didState);
      } else if (anchoredOperationModel.type === OperationType_1.default.Deactivate) {
        appliedDidState = yield this.applyDeactivateOperation(anchoredOperationModel, didState);
      } else {
        throw new SidetreeError_1.default(ErrorCode_1.default.OperationProcessorUnknownOperationType);
      }
      if (appliedDidState === undefined ||
                appliedDidState.lastOperationTransactionNumber === previousOperationTransactionNumber) {
        const index = anchoredOperationModel.operationIndex;
        const time = anchoredOperationModel.transactionTime;
        const number = anchoredOperationModel.transactionNumber;
        const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
        Logger_1.default.info(`Ignored invalid operation for DID '${didUniqueSuffix}' in transaction '${number}' at time '${time}' at operation index ${index}.`);
        return undefined;
      }
      return appliedDidState;
    });
  }

  getMultihashRevealValue (anchoredOperationModel) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (anchoredOperationModel.type === OperationType_1.default.Create) {
        throw new SidetreeError_1.default(ErrorCode_1.default.OperationProcessorCreateOperationDoesNotHaveRevealValue);
      }
      const operation = yield Operation_1.default.parse(anchoredOperationModel.operationBuffer);
      const multihashRevealValue = operation.revealValue;
      const multihashRevealValueBuffer = Encoder_1.default.decodeAsBuffer(multihashRevealValue);
      return multihashRevealValueBuffer;
    });
  }

  applyCreateOperation (anchoredOperationModel, didState) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (didState !== undefined) {
        return didState;
      }
      const operation = yield CreateOperation_1.default.parse(anchoredOperationModel.operationBuffer);
      const newDidState = {
        document: {},
        nextRecoveryCommitmentHash: operation.suffixData.recoveryCommitment,
        nextUpdateCommitmentHash: undefined,
        lastOperationTransactionNumber: anchoredOperationModel.transactionNumber
      };
      if (operation.delta === undefined) {
        return newDidState;
      }
      const deltaPayload = JsonCanonicalizer_1.default.canonicalizeAsBuffer(operation.delta);
      const isMatchingDelta = Multihash_1.default.verifyEncodedMultihashForContent(deltaPayload, operation.suffixData.deltaHash);
      if (!isMatchingDelta) {
        return newDidState;
      }
      ;
      const delta = operation.delta;
      newDidState.nextUpdateCommitmentHash = delta.updateCommitment;
      try {
        const document = {};
        DocumentComposer_1.default.applyPatches(document, delta.patches);
        newDidState.document = document;
      } catch (error) {
        const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
        const transactionNumber = anchoredOperationModel.transactionNumber;
        Logger_1.default.info(`Partial update on next commitment hash applied because: ` +
                    `Unable to apply delta patches for transaction number ${transactionNumber} for DID ${didUniqueSuffix}: ${SidetreeError_1.default.stringify(error)}.`);
      }
      return newDidState;
    });
  }

  applyUpdateOperation (anchoredOperationModel, didState) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const operation = yield UpdateOperation_1.default.parse(anchoredOperationModel.operationBuffer);
      const isValidUpdateKey = Multihash_1.default.canonicalizeAndVerifyDoubleHash(operation.signedData.updateKey, didState.nextUpdateCommitmentHash);
      if (!isValidUpdateKey) {
        return didState;
      }
      const signatureIsValid = yield operation.signedDataJws.verifySignature(operation.signedData.updateKey);
      if (!signatureIsValid) {
        return didState;
      }
      if (operation.delta === undefined) {
        return didState;
      }
      const deltaPayload = JsonCanonicalizer_1.default.canonicalizeAsBuffer(operation.delta);
      const isMatchingDelta = Multihash_1.default.verifyEncodedMultihashForContent(deltaPayload, operation.signedData.deltaHash);
      if (!isMatchingDelta) {
        return didState;
      }
      ;
      const newDidState = {
        nextRecoveryCommitmentHash: didState.nextRecoveryCommitmentHash,
        document: didState.document,
        nextUpdateCommitmentHash: operation.delta.updateCommitment,
        lastOperationTransactionNumber: anchoredOperationModel.transactionNumber
      };
      try {
        const documentDeepCopy = JsObject_1.default.deepCopyObject(didState.document);
        DocumentComposer_1.default.applyPatches(documentDeepCopy, operation.delta.patches);
        newDidState.document = documentDeepCopy;
      } catch (error) {
        const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
        const transactionNumber = anchoredOperationModel.transactionNumber;
        Logger_1.default.info(`Unable to apply document patch in transaction number ${transactionNumber} for DID ${didUniqueSuffix}: ${SidetreeError_1.default.stringify(error)}.`);
      }
      return newDidState;
    });
  }

  applyRecoverOperation (anchoredOperationModel, didState) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const operation = yield RecoverOperation_1.default.parse(anchoredOperationModel.operationBuffer);
      const isValidRecoveryKey = Multihash_1.default.canonicalizeAndVerifyDoubleHash(operation.signedData.recoveryKey, didState.nextRecoveryCommitmentHash);
      if (!isValidRecoveryKey) {
        return didState;
      }
      const signatureIsValid = yield operation.signedDataJws.verifySignature(operation.signedData.recoveryKey);
      if (!signatureIsValid) {
        return didState;
      }
      const newDidState = {
        nextRecoveryCommitmentHash: operation.signedData.recoveryCommitment,
        document: {},
        nextUpdateCommitmentHash: undefined,
        lastOperationTransactionNumber: anchoredOperationModel.transactionNumber
      };
      if (operation.delta === undefined) {
        return newDidState;
      }
      const deltaPayload = JsonCanonicalizer_1.default.canonicalizeAsBuffer(operation.delta);
      const isMatchingDelta = Multihash_1.default.verifyEncodedMultihashForContent(deltaPayload, operation.signedData.deltaHash);
      if (!isMatchingDelta) {
        return newDidState;
      }
      ;
      const delta = operation.delta;
      newDidState.nextUpdateCommitmentHash = delta.updateCommitment;
      try {
        const document = {};
        DocumentComposer_1.default.applyPatches(document, delta.patches);
        newDidState.document = document;
      } catch (error) {
        const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
        const transactionNumber = anchoredOperationModel.transactionNumber;
        Logger_1.default.info(`Partial update on next commitment hash applied because: ` +
                    `Unable to apply delta patches for transaction number ${transactionNumber} for DID ${didUniqueSuffix}: ${SidetreeError_1.default.stringify(error)}.`);
      }
      return newDidState;
    });
  }

  applyDeactivateOperation (anchoredOperationModel, didState) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const operation = yield DeactivateOperation_1.default.parse(anchoredOperationModel.operationBuffer);
      const isValidRecoveryKey = Multihash_1.default.canonicalizeAndVerifyDoubleHash(operation.signedData.recoveryKey, didState.nextRecoveryCommitmentHash);
      if (!isValidRecoveryKey) {
        return didState;
      }
      const signatureIsValid = yield operation.signedDataJws.verifySignature(operation.signedData.recoveryKey);
      if (!signatureIsValid) {
        return didState;
      }
      const newDidState = {
        document: didState.document,
        nextRecoveryCommitmentHash: undefined,
        nextUpdateCommitmentHash: undefined,
        lastOperationTransactionNumber: anchoredOperationModel.transactionNumber
      };
      return newDidState;
    });
  }
}
exports.default = OperationProcessor;
// # sourceMappingURL=OperationProcessor.js.map
