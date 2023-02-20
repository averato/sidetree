'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const AnchoredDataSerializer_1 = require('./AnchoredDataSerializer');
const ChunkFile_1 = require('./ChunkFile');
const CoreIndexFile_1 = require('./CoreIndexFile');
const CoreProofFile_1 = require('./CoreProofFile');
const FeeManager_1 = require('./FeeManager');
const LogColor_1 = require('../../../common/LogColor');
const Logger_1 = require('../../../common/Logger');
const Operation_1 = require('./Operation');
const OperationType_1 = require('../../enums/OperationType');
const ProtocolParameters_1 = require('./ProtocolParameters');
const ProvisionalIndexFile_1 = require('./ProvisionalIndexFile');
const ProvisionalProofFile_1 = require('./ProvisionalProofFile');
const ValueTimeLockVerifier_1 = require('./ValueTimeLockVerifier');
class BatchWriter {
  constructor (operationQueue, blockchain, cas, versionMetadataFetcher, confirmationStore) {
    this.operationQueue = operationQueue;
    this.blockchain = blockchain;
    this.cas = cas;
    this.versionMetadataFetcher = versionMetadataFetcher;
    this.confirmationStore = confirmationStore;
  }

  write () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const currentTime = yield this.blockchain.getLatestTime();
      const normalizedFee = yield this.blockchain.getFee(currentTime.time);
      const currentLock = yield this.blockchain.getWriterValueTimeLock();
      const numberOfOpsAllowed = BatchWriter.getNumberOfOperationsAllowed(this.versionMetadataFetcher, currentLock);
      const queuedOperations = yield this.operationQueue.peek(numberOfOpsAllowed);
      const numberOfOperations = queuedOperations.length;
      if (numberOfOperations === 0) {
        Logger_1.default.info(`No queued operations to batch.`);
        return 0;
      }
      const lastSubmitted = yield this.confirmationStore.getLastSubmitted();
      Logger_1.default.info(`Got the last submitted from ConfirmationStore: submitted at ${lastSubmitted === null || lastSubmitted === void 0 ? void 0 : lastSubmitted.submittedAt}, confirmed at ${lastSubmitted === null || lastSubmitted === void 0 ? void 0 : lastSubmitted.confirmedAt}.`);
      if (lastSubmitted !== undefined &&
                !BatchWriter.hasEnoughConfirmations(lastSubmitted.confirmedAt, currentTime.time)) {
        Logger_1.default.info(`Waiting for more confirmations. Confirmed at ${lastSubmitted.confirmedAt}, Current at ${currentTime.time}.`);
        return 0;
      }
      const operationModels = yield Promise.all(queuedOperations.map((queuedOperation) => tslib_1.__awaiter(this, void 0, void 0, function * () { return Operation_1.default.parse(queuedOperation.operationBuffer); })));
      const createOperations = operationModels.filter(operation => operation.type === OperationType_1.default.Create);
      const recoverOperations = operationModels.filter(operation => operation.type === OperationType_1.default.Recover);
      const updateOperations = operationModels.filter(operation => operation.type === OperationType_1.default.Update);
      const deactivateOperations = operationModels.filter(operation => operation.type === OperationType_1.default.Deactivate);
      const coreProofFileBuffer = yield CoreProofFile_1.default.createBuffer(recoverOperations, deactivateOperations);
      let coreProofFileUri;
      if (coreProofFileBuffer !== undefined) {
        coreProofFileUri = yield this.cas.write(coreProofFileBuffer);
      }
      const provisionalProofFileBuffer = yield ProvisionalProofFile_1.default.createBuffer(updateOperations);
      let provisionalProofFileUri;
      if (provisionalProofFileBuffer !== undefined) {
        provisionalProofFileUri = yield this.cas.write(provisionalProofFileBuffer);
      }
      const chunkFileUri = yield this.createAndWriteChunkFileIfNeeded(createOperations, recoverOperations, updateOperations);
      const provisionalIndexFileUri = yield this.createAndWriteProvisionalIndexFileIfNeeded(chunkFileUri, provisionalProofFileUri, updateOperations);
      const writerLockId = currentLock ? currentLock.identifier : undefined;
      const coreIndexFileBuffer = yield CoreIndexFile_1.default.createBuffer(writerLockId, provisionalIndexFileUri, coreProofFileUri, createOperations, recoverOperations, deactivateOperations);
      const coreIndexFileUri = yield this.cas.write(coreIndexFileBuffer);
      Logger_1.default.info(LogColor_1.default.lightBlue(`Wrote core index file ${LogColor_1.default.green(coreIndexFileUri)} to content addressable store.`));
      const dataToBeAnchored = {
        coreIndexFileUri,
        numberOfOperations
      };
      const stringToWriteToBlockchain = AnchoredDataSerializer_1.default.serialize(dataToBeAnchored);
      const fee = FeeManager_1.default.computeMinimumTransactionFee(normalizedFee, numberOfOperations);
      Logger_1.default.info(LogColor_1.default.lightBlue(`Writing data to blockchain: ${LogColor_1.default.green(stringToWriteToBlockchain)} with minimum fee of: ${LogColor_1.default.green(fee)}`));
      yield this.blockchain.write(stringToWriteToBlockchain, fee);
      Logger_1.default.info(`Transaction ${stringToWriteToBlockchain} is submitted at ${currentTime.time}`);
      yield this.confirmationStore.submit(stringToWriteToBlockchain, currentTime.time);
      yield this.operationQueue.dequeue(numberOfOperations);
      Logger_1.default.info(LogColor_1.default.lightBlue(`Batch size = ${LogColor_1.default.green(numberOfOperations)}`));
      return numberOfOperations;
    });
  }

  createAndWriteChunkFileIfNeeded (createOperations, recoverOperations, updateOperations) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const chunkFileBuffer = yield ChunkFile_1.default.createBuffer(createOperations, recoverOperations, updateOperations);
      if (chunkFileBuffer === undefined) {
        return undefined;
      }
      const chunkFileUri = yield this.cas.write(chunkFileBuffer);
      Logger_1.default.info(LogColor_1.default.lightBlue(`Wrote chunk file ${LogColor_1.default.green(chunkFileUri)} to content addressable store.`));
      return chunkFileUri;
    });
  }

  createAndWriteProvisionalIndexFileIfNeeded (chunkFileUri, provisionalProofFileUri, updateOperations) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (chunkFileUri === undefined) {
        return undefined;
      }
      const provisionalIndexFileBuffer = yield ProvisionalIndexFile_1.default.createBuffer(chunkFileUri, provisionalProofFileUri, updateOperations);
      const provisionalIndexFileUri = yield this.cas.write(provisionalIndexFileBuffer);
      Logger_1.default.info(LogColor_1.default.lightBlue(`Wrote provisional index file ${LogColor_1.default.green(provisionalIndexFileUri)} to content addressable store.`));
      return provisionalIndexFileUri;
    });
  }

  static hasEnoughConfirmations (confirmedAt, currentTime) {
    const minConfirmationBetweenWrites = 6;
    if (confirmedAt === undefined) {
      return false;
    }
    const numberOfConfirmations = currentTime - confirmedAt + 1;
    if (numberOfConfirmations < minConfirmationBetweenWrites) {
      return false;
    }
    return true;
  }

  static getNumberOfOperationsAllowed (versionMetadataFetcher, valueTimeLock) {
    const maxNumberOfOpsAllowedByProtocol = ProtocolParameters_1.default.maxOperationsPerBatch;
    const maxNumberOfOpsAllowedByLock = ValueTimeLockVerifier_1.default.calculateMaxNumberOfOperationsAllowed(valueTimeLock, versionMetadataFetcher);
    if (maxNumberOfOpsAllowedByLock > maxNumberOfOpsAllowedByProtocol) {
      Logger_1.default.info(`Maximum number of operations allowed by value time lock: ${maxNumberOfOpsAllowedByLock}; Maximum number of operations allowed by protocol: ${maxNumberOfOpsAllowedByProtocol}`);
    }
    return Math.min(maxNumberOfOpsAllowedByLock, maxNumberOfOpsAllowedByProtocol);
  }
}
exports.default = BatchWriter;
// # sourceMappingURL=BatchWriter.js.map
