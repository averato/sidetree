'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const AnchoredDataSerializer_1 = require('./AnchoredDataSerializer');
const ArrayMethods_1 = require('./util/ArrayMethods');
const ChunkFile_1 = require('./ChunkFile');
const CoreIndexFile_1 = require('./CoreIndexFile');
const CoreProofFile_1 = require('./CoreProofFile');
const ErrorCode_1 = require('./ErrorCode');
const FeeManager_1 = require('./FeeManager');
const FetchResultCode_1 = require('../../../common/enums/FetchResultCode');
const LogColor_1 = require('../../../common/LogColor');
const Logger_1 = require('../../../common/Logger');
const OperationType_1 = require('../../enums/OperationType');
const ProtocolParameters_1 = require('./ProtocolParameters');
const ProvisionalIndexFile_1 = require('./ProvisionalIndexFile');
const ProvisionalProofFile_1 = require('./ProvisionalProofFile');
const SidetreeError_1 = require('../../../common/SidetreeError');
const ValueTimeLockVerifier_1 = require('./ValueTimeLockVerifier');
class TransactionProcessor {
  constructor (downloadManager, operationStore, blockchain, versionMetadataFetcher) {
    this.downloadManager = downloadManager;
    this.operationStore = operationStore;
    this.blockchain = blockchain;
    this.versionMetadataFetcher = versionMetadataFetcher;
  }

  processTransaction (transaction) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      let anchoredData;
      let coreIndexFile;
      let coreProofFile;
      try {
        anchoredData = AnchoredDataSerializer_1.default.deserialize(transaction.anchorString);
        FeeManager_1.default.verifyTransactionFeeAndThrowOnError(transaction.transactionFeePaid, anchoredData.numberOfOperations, transaction.normalizedTransactionFee);
        coreIndexFile = yield this.downloadAndVerifyCoreIndexFile(transaction, anchoredData.coreIndexFileUri, anchoredData.numberOfOperations);
        coreProofFile = yield this.downloadAndVerifyCoreProofFile(coreIndexFile);
      } catch (error) {
        let retryNeeded = true;
        if (error instanceof SidetreeError_1.default) {
          if (error.code === ErrorCode_1.default.CasNotReachable ||
                        error.code === ErrorCode_1.default.CasFileNotFound) {
            retryNeeded = true;
          } else {
            Logger_1.default.info(LogColor_1.default.lightBlue(`Invalid core file found for anchor string '${LogColor_1.default.green(transaction.anchorString)}', the entire batch is discarded. Error: ${LogColor_1.default.yellow(error.message)}`));
            retryNeeded = false;
          }
        } else {
          Logger_1.default.error(LogColor_1.default.red(`Unexpected error while fetching and downloading core files, MUST investigate and fix: ${error}`));
          retryNeeded = true;
        }
        const transactionProcessedCompletely = !retryNeeded;
        return transactionProcessedCompletely;
      }
      let retryNeeded;
      let provisionalIndexFile;
      let provisionalProofFile;
      let chunkFileModel;
      try {
        provisionalIndexFile = yield this.downloadAndVerifyProvisionalIndexFile(coreIndexFile, anchoredData.numberOfOperations);
        provisionalProofFile = yield this.downloadAndVerifyProvisionalProofFile(provisionalIndexFile);
        chunkFileModel = yield this.downloadAndVerifyChunkFile(coreIndexFile, provisionalIndexFile);
        retryNeeded = false;
      } catch (error) {
        provisionalIndexFile = undefined;
        provisionalProofFile = undefined;
        chunkFileModel = undefined;
        if (error instanceof SidetreeError_1.default) {
          if (error.code === ErrorCode_1.default.CasNotReachable ||
                        error.code === ErrorCode_1.default.CasFileNotFound) {
            retryNeeded = true;
          } else {
            Logger_1.default.info(LogColor_1.default.lightBlue(`Invalid provisional/chunk file found for anchor string '${LogColor_1.default.green(transaction.anchorString)}', the entire batch is discarded. Error: ${LogColor_1.default.yellow(error.message)}`));
            retryNeeded = false;
          }
        } else {
          Logger_1.default.error(LogColor_1.default.red(`Unexpected error while fetching and downloading provisional files, MUST investigate and fix: ${error}`));
          retryNeeded = true;
        }
      }
      const operations = yield this.composeAnchoredOperationModels(transaction, coreIndexFile, provisionalIndexFile, coreProofFile, provisionalProofFile, chunkFileModel);
      yield this.operationStore.insertOrReplace(operations);
      Logger_1.default.info(LogColor_1.default.lightBlue(`Processed ${LogColor_1.default.green(operations.length)} operations. Retry needed: ${LogColor_1.default.green(retryNeeded)}`));
      const transactionProcessedCompletely = !retryNeeded;
      return transactionProcessedCompletely;
    });
  }

  downloadAndVerifyCoreIndexFile (transaction, coreIndexFileUri, paidOperationCount) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (paidOperationCount > ProtocolParameters_1.default.maxOperationsPerBatch) {
        throw new SidetreeError_1.default(ErrorCode_1.default.TransactionProcessorPaidOperationCountExceedsLimit, `Paid batch size of ${paidOperationCount} operations exceeds the allowed limit of ${ProtocolParameters_1.default.maxOperationsPerBatch}.`);
      }
      Logger_1.default.info(`Downloading core index file '${coreIndexFileUri}', max file size limit ${ProtocolParameters_1.default.maxCoreIndexFileSizeInBytes} bytes...`);
      const fileBuffer = yield this.downloadFileFromCas(coreIndexFileUri, ProtocolParameters_1.default.maxCoreIndexFileSizeInBytes);
      const coreIndexFile = yield CoreIndexFile_1.default.parse(fileBuffer);
      const operationCountInCoreIndexFile = coreIndexFile.didUniqueSuffixes.length;
      if (operationCountInCoreIndexFile > paidOperationCount) {
        throw new SidetreeError_1.default(ErrorCode_1.default.CoreIndexFileOperationCountExceededPaidLimit, `Operation count ${operationCountInCoreIndexFile} in core index file exceeded limit of : ${paidOperationCount}`);
      }
      const valueTimeLock = coreIndexFile.model.writerLockId
        ? yield this.blockchain.getValueTimeLock(coreIndexFile.model.writerLockId)
        : undefined;
      ValueTimeLockVerifier_1.default.verifyLockAmountAndThrowOnError(valueTimeLock, paidOperationCount, transaction.transactionTime, transaction.writer, this.versionMetadataFetcher);
      return coreIndexFile;
    });
  }

  downloadAndVerifyCoreProofFile (coreIndexFile) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const coreProofFileUri = coreIndexFile.model.coreProofFileUri;
      if (coreProofFileUri === undefined) {
        return;
      }
      Logger_1.default.info(`Downloading core proof file '${coreProofFileUri}', max file size limit ${ProtocolParameters_1.default.maxProofFileSizeInBytes}...`);
      const fileBuffer = yield this.downloadFileFromCas(coreProofFileUri, ProtocolParameters_1.default.maxProofFileSizeInBytes);
      const coreProofFile = yield CoreProofFile_1.default.parse(fileBuffer, coreIndexFile.deactivateDidSuffixes);
      const recoverAndDeactivateCount = coreIndexFile.deactivateDidSuffixes.length + coreIndexFile.recoverDidSuffixes.length;
      const proofCountInCoreProofFile = coreProofFile.deactivateProofs.length + coreProofFile.recoverProofs.length;
      if (recoverAndDeactivateCount !== proofCountInCoreProofFile) {
        throw new SidetreeError_1.default(ErrorCode_1.default.CoreProofFileProofCountNotTheSameAsOperationCountInCoreIndexFile, `Proof count of ${proofCountInCoreProofFile} in core proof file different to ` +
                    `recover + deactivate count of ${recoverAndDeactivateCount} in core index file.`);
      }
      return coreProofFile;
    });
  }

  downloadAndVerifyProvisionalProofFile (provisionalIndexFile) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (provisionalIndexFile === undefined || provisionalIndexFile.model.provisionalProofFileUri === undefined) {
        return;
      }
      const provisionalProofFileUri = provisionalIndexFile.model.provisionalProofFileUri;
      Logger_1.default.info(`Downloading provisional proof file '${provisionalProofFileUri}', max file size limit ${ProtocolParameters_1.default.maxProofFileSizeInBytes}...`);
      const fileBuffer = yield this.downloadFileFromCas(provisionalProofFileUri, ProtocolParameters_1.default.maxProofFileSizeInBytes);
      const provisionalProofFile = yield ProvisionalProofFile_1.default.parse(fileBuffer);
      const operationCountInProvisionalIndexFile = provisionalIndexFile.didUniqueSuffixes.length;
      const proofCountInProvisionalProofFile = provisionalProofFile.updateProofs.length;
      if (operationCountInProvisionalIndexFile !== proofCountInProvisionalProofFile) {
        throw new SidetreeError_1.default(ErrorCode_1.default.ProvisionalProofFileProofCountNotTheSameAsOperationCountInProvisionalIndexFile, `Proof count ${proofCountInProvisionalProofFile} in provisional proof file is different from ` +
                    `operation count ${operationCountInProvisionalIndexFile} in provisional index file.`);
      }
      return provisionalProofFile;
    });
  }

  downloadAndVerifyProvisionalIndexFile (coreIndexFile, paidOperationCount) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const coreIndexFileModel = coreIndexFile.model;
      const provisionalIndexFileUri = coreIndexFileModel.provisionalIndexFileUri;
      if (provisionalIndexFileUri === undefined) {
        return undefined;
      }
      Logger_1.default.info(`Downloading provisional index file '${provisionalIndexFileUri}', max file size limit ${ProtocolParameters_1.default.maxProvisionalIndexFileSizeInBytes}...`);
      const fileBuffer = yield this.downloadFileFromCas(provisionalIndexFileUri, ProtocolParameters_1.default.maxProvisionalIndexFileSizeInBytes);
      const provisionalIndexFile = yield ProvisionalIndexFile_1.default.parse(fileBuffer);
      const operationCountInCoreIndexFile = coreIndexFile.didUniqueSuffixes.length;
      const maxPaidUpdateOperationCount = paidOperationCount - operationCountInCoreIndexFile;
      const updateOperationCount = provisionalIndexFile.didUniqueSuffixes.length;
      if (updateOperationCount > maxPaidUpdateOperationCount) {
        throw new SidetreeError_1.default(ErrorCode_1.default.ProvisionalIndexFileUpdateOperationCountGreaterThanMaxPaidCount, `Update operation count of ${updateOperationCount} in provisional index file is greater than max paid count of ${maxPaidUpdateOperationCount}.`);
      }
      if (!ArrayMethods_1.default.areMutuallyExclusive(coreIndexFile.didUniqueSuffixes, provisionalIndexFile.didUniqueSuffixes)) {
        throw new SidetreeError_1.default(ErrorCode_1.default.ProvisionalIndexFileDidReferenceDuplicatedWithCoreIndexFile, `Provisional index file has at least one DID reference duplicated with core index file.`);
      }
      return provisionalIndexFile;
    });
  }

  downloadAndVerifyChunkFile (coreIndexFile, provisionalIndexFile) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (provisionalIndexFile === undefined) {
        return undefined;
      }
      const chunkFileUri = provisionalIndexFile.model.chunks[0].chunkFileUri;
      Logger_1.default.info(`Downloading chunk file '${chunkFileUri}', max size limit ${ProtocolParameters_1.default.maxChunkFileSizeInBytes}...`);
      const fileBuffer = yield this.downloadFileFromCas(chunkFileUri, ProtocolParameters_1.default.maxChunkFileSizeInBytes);
      const chunkFileModel = yield ChunkFile_1.default.parse(fileBuffer);
      const totalCountOfOperationsWithDelta = coreIndexFile.createDidSuffixes.length + coreIndexFile.recoverDidSuffixes.length + provisionalIndexFile.didUniqueSuffixes.length;
      if (chunkFileModel.deltas.length !== totalCountOfOperationsWithDelta) {
        throw new SidetreeError_1.default(ErrorCode_1.default.ChunkFileDeltaCountIncorrect, `Delta array length ${chunkFileModel.deltas.length} is not the same as the count of ${totalCountOfOperationsWithDelta} operations with delta.`);
      }
      return chunkFileModel;
    });
  }

  composeAnchoredOperationModels (transaction, coreIndexFile, provisionalIndexFile, coreProofFile, provisionalProofFile, chunkFile) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const anchoredCreateOperationModels = TransactionProcessor.composeAnchoredCreateOperationModels(transaction, coreIndexFile, chunkFile);
      const anchoredRecoverOperationModels = TransactionProcessor.composeAnchoredRecoverOperationModels(transaction, coreIndexFile, coreProofFile, chunkFile);
      const anchoredDeactivateOperationModels = TransactionProcessor.composeAnchoredDeactivateOperationModels(transaction, coreIndexFile, coreProofFile);
      const anchoredUpdateOperationModels = TransactionProcessor.composeAnchoredUpdateOperationModels(transaction, coreIndexFile, provisionalIndexFile, provisionalProofFile, chunkFile);
      const anchoredOperationModels = [];
      anchoredOperationModels.push(...anchoredCreateOperationModels);
      anchoredOperationModels.push(...anchoredRecoverOperationModels);
      anchoredOperationModels.push(...anchoredDeactivateOperationModels);
      anchoredOperationModels.push(...anchoredUpdateOperationModels);
      return anchoredOperationModels;
    });
  }

  static composeAnchoredCreateOperationModels (transaction, coreIndexFile, chunkFile) {
    if (coreIndexFile.createDidSuffixes.length === 0) {
      return [];
    }
    let createDeltas;
    if (chunkFile !== undefined) {
      createDeltas = chunkFile.deltas.slice(0, coreIndexFile.createDidSuffixes.length);
    }
    const createDidSuffixes = coreIndexFile.createDidSuffixes;
    const anchoredOperationModels = [];
    for (let i = 0; i < createDidSuffixes.length; i++) {
      const suffixData = coreIndexFile.model.operations.create[i].suffixData;
      const composedRequest = {
        type: OperationType_1.default.Create,
        suffixData: suffixData,
        delta: createDeltas === null || createDeltas === void 0 ? void 0 : createDeltas[i]
      };
      const operationBuffer = Buffer.from(JSON.stringify(composedRequest));
      const anchoredOperationModel = {
        didUniqueSuffix: createDidSuffixes[i],
        type: OperationType_1.default.Create,
        operationBuffer,
        operationIndex: i,
        transactionNumber: transaction.transactionNumber,
        transactionTime: transaction.transactionTime
      };
      anchoredOperationModels.push(anchoredOperationModel);
    }
    return anchoredOperationModels;
  }

  static composeAnchoredRecoverOperationModels (transaction, coreIndexFile, coreProofFile, chunkFile) {
    if (coreIndexFile.recoverDidSuffixes.length === 0) {
      return [];
    }
    let recoverDeltas;
    if (chunkFile !== undefined) {
      const recoverDeltaStartIndex = coreIndexFile.createDidSuffixes.length;
      const recoverDeltaEndIndexExclusive = recoverDeltaStartIndex + coreIndexFile.recoverDidSuffixes.length;
      recoverDeltas = chunkFile.deltas.slice(recoverDeltaStartIndex, recoverDeltaEndIndexExclusive);
    }
    const recoverDidSuffixes = coreIndexFile.recoverDidSuffixes;
    const recoverProofs = coreProofFile.recoverProofs.map((proof) => proof.signedDataJws.toCompactJws());
    const anchoredOperationModels = [];
    for (let i = 0; i < recoverDidSuffixes.length; i++) {
      const composedRequest = {
        type: OperationType_1.default.Recover,
        didSuffix: recoverDidSuffixes[i],
        revealValue: coreIndexFile.model.operations.recover[i].revealValue,
        signedData: recoverProofs[i],
        delta: recoverDeltas === null || recoverDeltas === void 0 ? void 0 : recoverDeltas[i]
      };
      const operationBuffer = Buffer.from(JSON.stringify(composedRequest));
      const anchoredOperationModel = {
        didUniqueSuffix: recoverDidSuffixes[i],
        type: OperationType_1.default.Recover,
        operationBuffer,
        operationIndex: coreIndexFile.createDidSuffixes.length + i,
        transactionNumber: transaction.transactionNumber,
        transactionTime: transaction.transactionTime
      };
      anchoredOperationModels.push(anchoredOperationModel);
    }
    return anchoredOperationModels;
  }

  static composeAnchoredDeactivateOperationModels (transaction, coreIndexFile, coreProofFile) {
    if (coreIndexFile.deactivateDidSuffixes.length === 0) {
      return [];
    }
    const deactivateDidSuffixes = coreIndexFile.deactivateDidSuffixes;
    const deactivateProofs = coreProofFile.deactivateProofs.map((proof) => proof.signedDataJws.toCompactJws());
    const anchoredOperationModels = [];
    for (let i = 0; i < deactivateDidSuffixes.length; i++) {
      const composedRequest = {
        type: OperationType_1.default.Deactivate,
        didSuffix: deactivateDidSuffixes[i],
        revealValue: coreIndexFile.model.operations.deactivate[i].revealValue,
        signedData: deactivateProofs[i]
      };
      const operationBuffer = Buffer.from(JSON.stringify(composedRequest));
      const anchoredOperationModel = {
        didUniqueSuffix: deactivateDidSuffixes[i],
        type: OperationType_1.default.Deactivate,
        operationBuffer,
        operationIndex: coreIndexFile.createDidSuffixes.length + coreIndexFile.recoverDidSuffixes.length + i,
        transactionNumber: transaction.transactionNumber,
        transactionTime: transaction.transactionTime
      };
      anchoredOperationModels.push(anchoredOperationModel);
    }
    return anchoredOperationModels;
  }

  static composeAnchoredUpdateOperationModels (transaction, coreIndexFile, provisionalIndexFile, provisionalProofFile, chunkFile) {
    if (provisionalIndexFile === undefined ||
            provisionalIndexFile.didUniqueSuffixes.length === 0) {
      return [];
    }
    let updateDeltas;
    if (chunkFile !== undefined) {
      const updateDeltaStartIndex = coreIndexFile.createDidSuffixes.length + coreIndexFile.recoverDidSuffixes.length;
      updateDeltas = chunkFile.deltas.slice(updateDeltaStartIndex);
    }
    const updateDidSuffixes = provisionalIndexFile.didUniqueSuffixes;
    const updateProofs = provisionalProofFile.updateProofs.map((proof) => proof.signedDataJws.toCompactJws());
    const anchoredOperationModels = [];
    for (let i = 0; i < updateDidSuffixes.length; i++) {
      const composedRequest = {
        type: OperationType_1.default.Update,
        didSuffix: updateDidSuffixes[i],
        revealValue: provisionalIndexFile.model.operations.update[i].revealValue,
        signedData: updateProofs[i],
        delta: updateDeltas === null || updateDeltas === void 0 ? void 0 : updateDeltas[i]
      };
      const operationBuffer = Buffer.from(JSON.stringify(composedRequest));
      const anchoredOperationModel = {
        didUniqueSuffix: updateDidSuffixes[i],
        type: OperationType_1.default.Update,
        operationBuffer,
        operationIndex: coreIndexFile.didUniqueSuffixes.length + i,
        transactionNumber: transaction.transactionNumber,
        transactionTime: transaction.transactionTime
      };
      anchoredOperationModels.push(anchoredOperationModel);
    }
    return anchoredOperationModels;
  }

  downloadFileFromCas (fileUri, maxFileSizeInBytes) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      Logger_1.default.info(`Downloading file '${fileUri}', max size limit ${maxFileSizeInBytes}...`);
      const fileFetchResult = yield this.downloadManager.download(fileUri, maxFileSizeInBytes);
      if (fileFetchResult.code === FetchResultCode_1.default.InvalidHash) {
        throw new SidetreeError_1.default(ErrorCode_1.default.CasFileUriNotValid, `File hash '${fileUri}' is not a valid hash.`);
      }
      if (fileFetchResult.code === FetchResultCode_1.default.MaxSizeExceeded) {
        throw new SidetreeError_1.default(ErrorCode_1.default.CasFileTooLarge, `File '${fileUri}' exceeded max size limit of ${maxFileSizeInBytes} bytes.`);
      }
      if (fileFetchResult.code === FetchResultCode_1.default.NotAFile) {
        throw new SidetreeError_1.default(ErrorCode_1.default.CasFileNotAFile, `File hash '${fileUri}' points to a content that is not a file.`);
      }
      if (fileFetchResult.code === FetchResultCode_1.default.CasNotReachable) {
        throw new SidetreeError_1.default(ErrorCode_1.default.CasNotReachable, `CAS not reachable for file '${fileUri}'.`);
      }
      if (fileFetchResult.code === FetchResultCode_1.default.NotFound) {
        throw new SidetreeError_1.default(ErrorCode_1.default.CasFileNotFound, `File '${fileUri}' not found.`);
      }
      Logger_1.default.info(`File '${fileUri}' of size ${fileFetchResult.content.length} downloaded.`);
      return fileFetchResult.content;
    });
  }
}
exports.default = TransactionProcessor;
// # sourceMappingURL=TransactionProcessor.js.map
