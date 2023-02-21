'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const AnchoredDataSerializer_1 = require('../../lib/core/versions/latest/AnchoredDataSerializer');
const ChunkFile_1 = require('../../lib/core/versions/latest/ChunkFile');
const Compressor_1 = require('../../lib/core/versions/latest/util/Compressor');
const CoreIndexFile_1 = require('../../lib/core/versions/latest/CoreIndexFile');
const CoreProofFile_1 = require('../../lib/core/versions/latest/CoreProofFile');
const DownloadManager_1 = require('../../lib/core/DownloadManager');
const ErrorCode_1 = require('../../lib/core/versions/latest/ErrorCode');
const FeeManager_1 = require('../../lib/core/versions/latest/FeeManager');
const FetchResultCode_1 = require('../../lib/common/enums/FetchResultCode');
const FileGenerator_1 = require('../generators/FileGenerator');
const Ipfs_1 = require('../../lib/ipfs/Ipfs');
const JasmineSidetreeErrorValidator_1 = require('../JasmineSidetreeErrorValidator');
const Jwk_1 = require('../../lib/core/versions/latest/util/Jwk');
const MockBlockchain_1 = require('../mocks/MockBlockchain');
const MockOperationStore_1 = require('../mocks/MockOperationStore');
const OperationGenerator_1 = require('../generators/OperationGenerator');
const ProvisionalIndexFile_1 = require('../../lib/core/versions/latest/ProvisionalIndexFile');
const ProvisionalProofFile_1 = require('../../lib/core/versions/latest/ProvisionalProofFile');
const SidetreeError_1 = require('../../lib/common/SidetreeError');
const TransactionProcessor_1 = require('../../lib/core/versions/latest/TransactionProcessor');
const ValueTimeLockVerifier_1 = require('../../lib/core/versions/latest/ValueTimeLockVerifier');
describe('TransactionProcessor', () => {
  let casClient;
  let operationStore;
  let downloadManager;
  let blockchain;
  let transactionProcessor;
  let versionMetadataFetcher = {};
  const versionMetadata = {
    normalizedFeeToPerOperationFeeMultiplier: 0.01
  };
  versionMetadataFetcher = {
    getVersionMetadata: () => {
      return versionMetadata;
    }
  };
  beforeEach(() => {
    const fetchTimeoutInSeconds = 1;
    casClient = new Ipfs_1.default('unusedUri', fetchTimeoutInSeconds);
    const maxConcurrentDownloads = 10;
    downloadManager = new DownloadManager_1.default(maxConcurrentDownloads, casClient);
    downloadManager.start();
    operationStore = new MockOperationStore_1.default();
    blockchain = new MockBlockchain_1.default();
    transactionProcessor = new TransactionProcessor_1.default(downloadManager, operationStore, blockchain, versionMetadataFetcher);
  });
  describe('processTransaction()', () => {
    it('should ignore error and return true when AnchoredDataSerializer throws a sidetree error', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const anchoredData = 'Bad Format';
      const mockTransaction = {
        transactionNumber: 1,
        transactionTime: 1000000,
        transactionTimeHash: '1000',
        anchorString: anchoredData,
        transactionFeePaid: 1,
        normalizedTransactionFee: 1,
        writer: 'writer'
      };
      const result = yield transactionProcessor.processTransaction(mockTransaction);
      expect(result).toBeTruthy();
    }));
    it('should ignore error and return true when FeeManager throws a sidetree error', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const anchoredData = AnchoredDataSerializer_1.default.serialize({ coreIndexFileUri: '1stTransaction', numberOfOperations: 0 });
      const mockTransaction = {
        transactionNumber: 1,
        transactionTime: 1000000,
        transactionTimeHash: '1000',
        anchorString: anchoredData,
        transactionFeePaid: 1,
        normalizedTransactionFee: 1,
        writer: 'writer'
      };
      const result = yield transactionProcessor.processTransaction(mockTransaction);
      expect(result).toBeTruthy();
    }));
    it('should return true if core index file hash is not valid', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      spyOn(downloadManager, 'download').and.callFake(() => {
        const result = { code: FetchResultCode_1.default.InvalidHash };
        return new Promise((resolve) => {
          resolve(result);
        });
      });
      const anchoredData = AnchoredDataSerializer_1.default.serialize({ coreIndexFileUri: '1stTransaction', numberOfOperations: 1 });
      const mockTransaction = {
        transactionNumber: 1,
        transactionTime: 1000000,
        transactionTimeHash: '1000',
        anchorString: anchoredData,
        transactionFeePaid: 999999,
        normalizedTransactionFee: 1,
        writer: 'writer'
      };
      const result = yield transactionProcessor.processTransaction(mockTransaction);
      expect(result).toBeTruthy();
    }));
    it('should return true if fetch result code is max size exceeded', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      spyOn(downloadManager, 'download').and.callFake(() => {
        const result = { code: FetchResultCode_1.default.MaxSizeExceeded };
        return new Promise((resolve) => {
          resolve(result);
        });
      });
      const anchoredData = AnchoredDataSerializer_1.default.serialize({ coreIndexFileUri: '1stTransaction', numberOfOperations: 1 });
      const mockTransaction = {
        transactionNumber: 1,
        transactionTime: 1000000,
        transactionTimeHash: '1000',
        anchorString: anchoredData,
        transactionFeePaid: 999999,
        normalizedTransactionFee: 1,
        writer: 'writer'
      };
      const result = yield transactionProcessor.processTransaction(mockTransaction);
      expect(result).toBeTruthy();
    }));
    it('should return true if fetch result code is not a file', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      spyOn(downloadManager, 'download').and.callFake(() => {
        const result = { code: FetchResultCode_1.default.NotAFile };
        return new Promise((resolve) => {
          resolve(result);
        });
      });
      const anchoredData = AnchoredDataSerializer_1.default.serialize({ coreIndexFileUri: '1stTransaction', numberOfOperations: 1 });
      const mockTransaction = {
        transactionNumber: 1,
        transactionTime: 1000000,
        transactionTimeHash: '1000',
        anchorString: anchoredData,
        transactionFeePaid: 999999,
        normalizedTransactionFee: 1,
        writer: 'writer'
      };
      const result = yield transactionProcessor.processTransaction(mockTransaction);
      expect(result).toBeTruthy();
    }));
    it('should return true if fetch result code is cas not reachable', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      spyOn(downloadManager, 'download').and.callFake(() => {
        const result = { code: FetchResultCode_1.default.CasNotReachable };
        return new Promise((resolve) => {
          resolve(result);
        });
      });
      const anchoredData = AnchoredDataSerializer_1.default.serialize({ coreIndexFileUri: '1stTransaction', numberOfOperations: 1 });
      const mockTransaction = {
        transactionNumber: 1,
        transactionTime: 1000000,
        transactionTimeHash: '1000',
        anchorString: anchoredData,
        transactionFeePaid: 999999,
        normalizedTransactionFee: 1,
        writer: 'writer'
      };
      const result = yield transactionProcessor.processTransaction(mockTransaction);
      expect(result).toBeFalsy();
    }));
    it('should return true if fetch result code is not found', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      spyOn(downloadManager, 'download').and.callFake(() => {
        const result = { code: FetchResultCode_1.default.NotFound };
        return new Promise((resolve) => {
          resolve(result);
        });
      });
      const anchoredData = AnchoredDataSerializer_1.default.serialize({ coreIndexFileUri: '1stTransaction', numberOfOperations: 1 });
      const mockTransaction = {
        transactionNumber: 1,
        transactionTime: 1000000,
        transactionTimeHash: '1000',
        anchorString: anchoredData,
        transactionFeePaid: 999999,
        normalizedTransactionFee: 1,
        writer: 'writer'
      };
      const result = yield transactionProcessor.processTransaction(mockTransaction);
      expect(result).toBeFalsy();
    }));
    it('should return false to allow retry if unexpected error is thrown', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const anchoredData = AnchoredDataSerializer_1.default.serialize({ coreIndexFileUri: '1stTransaction', numberOfOperations: 1 });
      const mockTransaction = {
        transactionNumber: 1,
        transactionTime: 1000000,
        transactionTimeHash: '1000',
        anchorString: anchoredData,
        transactionFeePaid: 999999,
        normalizedTransactionFee: 1,
        writer: 'writer'
      };
      spyOn(AnchoredDataSerializer_1.default, 'deserialize').and.throwError('Some unexpected error.');
      const result = yield transactionProcessor.processTransaction(mockTransaction);
      expect(result).toBeFalsy();
    }));
    it('should continue to compose the operations and return false if unexpected error is thrown when downloading provisional index file.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      spyOn(FeeManager_1.default, 'verifyTransactionFeeAndThrowOnError');
      spyOn(transactionProcessor, 'downloadAndVerifyCoreIndexFile').and.returnValue('unused');
      spyOn(transactionProcessor, 'downloadAndVerifyCoreProofFile');
      spyOn(transactionProcessor, 'downloadAndVerifyProvisionalIndexFile').and.throwError('any unexpected error');
      const composeAnchoredOperationModelsSpy = spyOn(transactionProcessor, 'composeAnchoredOperationModels').and.returnValue([]);
      const operationStoreSpy = spyOn(operationStore, 'insertOrReplace');
      const anyTransactionModel = OperationGenerator_1.default.generateTransactionModel();
      const transactionProcessedCompletely = yield transactionProcessor.processTransaction(anyTransactionModel);
      expect(composeAnchoredOperationModelsSpy).toHaveBeenCalled();
      expect(operationStoreSpy).toHaveBeenCalled();
      expect(transactionProcessedCompletely).toBeFalsy();
    }));
    it('should continue to compose the operations and return false if network error is thrown when downloading provisional index file.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      spyOn(FeeManager_1.default, 'verifyTransactionFeeAndThrowOnError');
      spyOn(transactionProcessor, 'downloadAndVerifyCoreIndexFile').and.returnValue('unused');
      spyOn(transactionProcessor, 'downloadAndVerifyCoreProofFile');
      spyOn(transactionProcessor, 'downloadAndVerifyProvisionalIndexFile').and.callFake(() => { throw new SidetreeError_1.default(ErrorCode_1.default.CasFileNotFound); });
      const composeAnchoredOperationModelsSpy = spyOn(transactionProcessor, 'composeAnchoredOperationModels').and.returnValue([]);
      const operationStoreSpy = spyOn(operationStore, 'insertOrReplace');
      const anyTransactionModel = OperationGenerator_1.default.generateTransactionModel();
      const transactionProcessedCompletely = yield transactionProcessor.processTransaction(anyTransactionModel);
      expect(composeAnchoredOperationModelsSpy).toHaveBeenCalled();
      expect(operationStoreSpy).toHaveBeenCalled();
      expect(transactionProcessedCompletely).toBeFalsy();
    }));
    it('should continue to compose the operations and return true if non-network Sidetree error is thrown when downloading provisional index file.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      spyOn(FeeManager_1.default, 'verifyTransactionFeeAndThrowOnError');
      spyOn(transactionProcessor, 'downloadAndVerifyCoreIndexFile').and.returnValue('unused');
      spyOn(transactionProcessor, 'downloadAndVerifyCoreProofFile');
      spyOn(transactionProcessor, 'downloadAndVerifyProvisionalIndexFile').and.callFake(() => { throw new SidetreeError_1.default(ErrorCode_1.default.ChunkFileDeltasNotArrayOfObjects); });
      const composeAnchoredOperationModelsSpy = spyOn(transactionProcessor, 'composeAnchoredOperationModels').and.returnValue([]);
      const operationStoreSpy = spyOn(operationStore, 'insertOrReplace');
      const anyTransactionModel = OperationGenerator_1.default.generateTransactionModel();
      const transactionProcessedCompletely = yield transactionProcessor.processTransaction(anyTransactionModel);
      expect(composeAnchoredOperationModelsSpy).toHaveBeenCalled();
      expect(operationStoreSpy).toHaveBeenCalled();
      expect(transactionProcessedCompletely).toBeTruthy();
    }));
  });
  describe('downloadAndVerifyCoreIndexFile', () => {
    it('should throw if paid operation count exceeded the protocol limit.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const mockTransaction = {
        anchorString: 'anchor string',
        normalizedTransactionFee: 123,
        transactionFeePaid: 1234,
        transactionNumber: 98765,
        transactionTime: 5678,
        transactionTimeHash: 'transaction time hash',
        writer: 'writer'
      };
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => transactionProcessor['downloadAndVerifyCoreIndexFile'](mockTransaction, 'mock_hash', 999999), ErrorCode_1.default.TransactionProcessorPaidOperationCountExceedsLimit);
      done();
    }));
    it('should throw if operation count in core index file exceeded the paid limit.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const createOperation1 = (yield OperationGenerator_1.default.generateCreateOperation()).createOperation;
      const createOperation2 = (yield OperationGenerator_1.default.generateCreateOperation()).createOperation;
      const anyHash = OperationGenerator_1.default.generateRandomHash();
      const mockCoreIndexFileModel = yield CoreIndexFile_1.default.createModel('writerLockId', anyHash, undefined, [createOperation1, createOperation2], [], []);
      const mockCoreIndexFileBuffer = yield Compressor_1.default.compress(Buffer.from(JSON.stringify(mockCoreIndexFileModel)));
      spyOn(transactionProcessor, 'downloadFileFromCas').and.returnValue(Promise.resolve(mockCoreIndexFileBuffer));
      const mockTransaction = {
        anchorString: 'anchor string',
        normalizedTransactionFee: 123,
        transactionFeePaid: 1234,
        transactionNumber: 98765,
        transactionTime: 5678,
        transactionTimeHash: 'transaction time hash',
        writer: 'writer'
      };
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => transactionProcessor['downloadAndVerifyCoreIndexFile'](mockTransaction, 'mock_hash', 1), ErrorCode_1.default.CoreIndexFileOperationCountExceededPaidLimit);
      done();
    }));
    it('should bubble up any errors thrown by verify lock routine', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      spyOn(transactionProcessor, 'downloadFileFromCas').and.returnValue(Promise.resolve(Buffer.from('value')));
      const mockCoreIndexFile = {
        createDidSuffixes: [],
        didUniqueSuffixes: ['abc', 'def'],
        model: { writerLockId: 'lock', provisionalIndexFileUri: 'map_hash', operations: {} },
        recoverDidSuffixes: [],
        deactivateDidSuffixes: []
      };
      spyOn(CoreIndexFile_1.default, 'parse').and.returnValue(Promise.resolve(mockCoreIndexFile));
      const mockValueTimeLock = {
        amountLocked: 1234,
        identifier: 'identifier',
        lockTransactionTime: 1234,
        unlockTransactionTime: 7890,
        normalizedFee: 200,
        owner: 'owner'
      };
      spyOn(transactionProcessor['blockchain'], 'getValueTimeLock').and.returnValue(Promise.resolve(mockValueTimeLock));
      const mockTransaction = {
        anchorString: 'anchor string',
        normalizedTransactionFee: 123,
        transactionFeePaid: 1234,
        transactionNumber: 98765,
        transactionTime: 5678,
        transactionTimeHash: 'transaction time hash',
        writer: 'writer'
      };
      const mockErrorCode = 'some error code';
      const lockVerifySpy = spyOn(ValueTimeLockVerifier_1.default, 'verifyLockAmountAndThrowOnError').and.callFake(() => {
        throw new SidetreeError_1.default(mockErrorCode);
      });
      const paidOperationCount = 52;
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => transactionProcessor['downloadAndVerifyCoreIndexFile'](mockTransaction, 'anchor_hash', paidOperationCount), mockErrorCode);
      expect(lockVerifySpy)
        .toHaveBeenCalledWith(mockValueTimeLock, paidOperationCount, mockTransaction.transactionTime, mockTransaction.writer, versionMetadataFetcher);
      done();
    }));
    it('should return the parsed file.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const createOperationData = yield OperationGenerator_1.default.generateCreateOperation();
      const anyHash = OperationGenerator_1.default.generateRandomHash();
      const mockCoreIndexFileModel = yield CoreIndexFile_1.default.createModel(undefined, anyHash, undefined, [createOperationData.createOperation], [], []);
      const mockCoreIndexFileBuffer = yield Compressor_1.default.compress(Buffer.from(JSON.stringify(mockCoreIndexFileModel)));
      spyOn(transactionProcessor, 'downloadFileFromCas').and.returnValue(Promise.resolve(mockCoreIndexFileBuffer));
      spyOn(transactionProcessor['blockchain'], 'getValueTimeLock').and.returnValue(Promise.resolve(undefined));
      spyOn(ValueTimeLockVerifier_1.default, 'verifyLockAmountAndThrowOnError').and.returnValue(undefined);
      const mockTransaction = {
        anchorString: 'anchor string',
        normalizedTransactionFee: 123,
        transactionFeePaid: 1234,
        transactionNumber: 98765,
        transactionTime: 5678,
        transactionTimeHash: 'transaction time hash',
        writer: 'writer'
      };
      const paidBatchSize = 2;
      const downloadedCoreIndexFile = yield transactionProcessor['downloadAndVerifyCoreIndexFile'](mockTransaction, 'mock_hash', paidBatchSize);
      expect(JSON.stringify(downloadedCoreIndexFile.model)).toEqual(JSON.stringify(mockCoreIndexFileModel));
      done();
    }));
  });
  describe('downloadAndVerifyProvisionalIndexFile', () => {
    it('should validate a valid provisional index file for the case that it does not have the `operations` property.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const createOperationData = yield OperationGenerator_1.default.generateCreateOperation();
      const provisionalIndexFileUri = OperationGenerator_1.default.generateRandomHash();
      const coreProofFileUri = undefined;
      const coreIndexFileBuffer = yield CoreIndexFile_1.default.createBuffer('writerLockId', provisionalIndexFileUri, coreProofFileUri, [createOperationData.createOperation], [], []);
      const coreIndexFile = yield CoreIndexFile_1.default.parse(coreIndexFileBuffer);
      const provisionalProofFileUri = undefined;
      const chunkFileUri = OperationGenerator_1.default.generateRandomHash();
      const mockProvisionalIndexFileBuffer = yield ProvisionalIndexFile_1.default.createBuffer(chunkFileUri, provisionalProofFileUri, []);
      spyOn(transactionProcessor, 'downloadFileFromCas').and.returnValue(Promise.resolve(mockProvisionalIndexFileBuffer));
      const totalPaidOperationCount = 1;
      const fetchedProvisionalIndexFile = yield transactionProcessor['downloadAndVerifyProvisionalIndexFile'](coreIndexFile, totalPaidOperationCount);
      expect(fetchedProvisionalIndexFile).toBeDefined();
      expect(fetchedProvisionalIndexFile.didUniqueSuffixes.length).toEqual(0);
      expect(fetchedProvisionalIndexFile.model.chunks[0].chunkFileUri).toEqual(chunkFileUri);
      done();
    }));
    it('should throw if update operation count is greater than the max paid update operation count.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const createOperationData = yield OperationGenerator_1.default.generateCreateOperation();
      const provisionalIndexFileUri = OperationGenerator_1.default.generateRandomHash();
      const coreProofFileUri = undefined;
      const coreIndexFileBuffer = yield CoreIndexFile_1.default.createBuffer('writerLockId', provisionalIndexFileUri, coreProofFileUri, [createOperationData.createOperation], [], []);
      const coreIndexFile = yield CoreIndexFile_1.default.parse(coreIndexFileBuffer);
      const provisionalProofFileUri = OperationGenerator_1.default.generateRandomHash();
      const updateOperationRequestData = yield OperationGenerator_1.default.generateUpdateOperationRequest();
      const chunkFileUri = OperationGenerator_1.default.generateRandomHash();
      const mockProvisionalIndexFileBuffer = yield ProvisionalIndexFile_1.default.createBuffer(chunkFileUri, provisionalProofFileUri, [updateOperationRequestData.updateOperation]);
      spyOn(transactionProcessor, 'downloadFileFromCas').and.returnValue(Promise.resolve(mockProvisionalIndexFileBuffer));
      const totalPaidOperationCount = 1;
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => transactionProcessor['downloadAndVerifyProvisionalIndexFile'](coreIndexFile, totalPaidOperationCount), ErrorCode_1.default.ProvisionalIndexFileUpdateOperationCountGreaterThanMaxPaidCount);
    }));
    it('should return undefined if core index file does not contain the provisional index file URI.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const deactivateDidSuffix = OperationGenerator_1.default.generateRandomHash();
      const coreIndexFileModel = {
        coreProofFileUri: OperationGenerator_1.default.generateRandomHash(),
        operations: {
          deactivate: [
            {
              didSuffix: deactivateDidSuffix,
              revealValue: OperationGenerator_1.default.generateRandomHash()
            }
          ]
        }
      };
      const coreIndexFile = new CoreIndexFile_1.default(coreIndexFileModel, [deactivateDidSuffix], [], [], [deactivateDidSuffix]);
      const totalPaidOperationCount = 1;
      const fetchedProvisionalIndexFile = yield transactionProcessor['downloadAndVerifyProvisionalIndexFile'](coreIndexFile, totalPaidOperationCount);
      expect(fetchedProvisionalIndexFile).toBeUndefined();
    }));
    it('should throw if there is a duplicate DID between core and provisional index file.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const createOperationData = yield OperationGenerator_1.default.generateCreateOperation();
      const provisionalIndexFileUri = OperationGenerator_1.default.generateRandomHash();
      const coreProofFileUri = undefined;
      const coreIndexFileBuffer = yield CoreIndexFile_1.default.createBuffer('writerLockId', provisionalIndexFileUri, coreProofFileUri, [createOperationData.createOperation], [], []);
      const coreIndexFile = yield CoreIndexFile_1.default.parse(coreIndexFileBuffer);
      const provisionalProofFileUri = OperationGenerator_1.default.generateRandomHash();
      const updateOperationRequestData = yield OperationGenerator_1.default.generateUpdateOperationRequest(createOperationData.createOperation.didUniqueSuffix);
      const chunkFileUri = OperationGenerator_1.default.generateRandomHash();
      const mockProvisionalIndexFileBuffer = yield ProvisionalIndexFile_1.default.createBuffer(chunkFileUri, provisionalProofFileUri, [updateOperationRequestData.updateOperation]);
      spyOn(transactionProcessor, 'downloadFileFromCas').and.returnValue(Promise.resolve(mockProvisionalIndexFileBuffer));
      const totalPaidOperationCount = 10;
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => transactionProcessor['downloadAndVerifyProvisionalIndexFile'](coreIndexFile, totalPaidOperationCount), ErrorCode_1.default.ProvisionalIndexFileDidReferenceDuplicatedWithCoreIndexFile);
    }));
  });
  describe('downloadAndVerifyCoreProofFile()', () => {
    it('should download and parse the core proof file.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const createOperationData = yield OperationGenerator_1.default.generateCreateOperation();
      const createOperation = createOperationData.createOperation;
      const [, anyPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const recoverOperationData = yield OperationGenerator_1.default.generateRecoverOperation({ didUniqueSuffix: 'EiBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', recoveryPrivateKey: anyPrivateKey });
      const recoverOperation = recoverOperationData.recoverOperation;
      const deactivateOperationData = yield OperationGenerator_1.default.createDeactivateOperation('EiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', anyPrivateKey);
      const deactivateOperation = deactivateOperationData.deactivateOperation;
      const provisionalIndexFileUri = OperationGenerator_1.default.generateRandomHash();
      const coreProofFileUri = OperationGenerator_1.default.generateRandomHash();
      const coreIndexFileBuffer = yield CoreIndexFile_1.default.createBuffer('writerLockId', provisionalIndexFileUri, coreProofFileUri, [createOperation], [recoverOperation], [deactivateOperation]);
      const coreIndexFile = yield CoreIndexFile_1.default.parse(coreIndexFileBuffer);
      const mockCoreProofFileBuffer = yield CoreProofFile_1.default.createBuffer([recoverOperation], [deactivateOperation]);
      spyOn(transactionProcessor, 'downloadFileFromCas').and.returnValue(Promise.resolve(mockCoreProofFileBuffer));
      const actualProcessedCoreProofFile = yield transactionProcessor['downloadAndVerifyCoreProofFile'](coreIndexFile);
      expect(actualProcessedCoreProofFile).toBeDefined();
      expect(actualProcessedCoreProofFile.recoverProofs.length).toEqual(1);
      expect(actualProcessedCoreProofFile.recoverProofs[0].signedDataJws).toEqual(recoverOperationData.recoverOperation.signedDataJws);
      expect(actualProcessedCoreProofFile.deactivateProofs.length).toEqual(1);
      expect(actualProcessedCoreProofFile.deactivateProofs[0].signedDataJws).toEqual(deactivateOperationData.deactivateOperation.signedDataJws);
    }));
    it('should throw if core proof count is not the same as the recover and deactivate combined count.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const [, anyPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const recoverOperationData = yield OperationGenerator_1.default.generateRecoverOperation({ didUniqueSuffix: 'EiBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', recoveryPrivateKey: anyPrivateKey });
      const recoverOperation = recoverOperationData.recoverOperation;
      const deactivateOperationData = yield OperationGenerator_1.default.createDeactivateOperation('EiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', anyPrivateKey);
      const deactivateOperation = deactivateOperationData.deactivateOperation;
      const provisionalIndexFileUri = OperationGenerator_1.default.generateRandomHash();
      const coreProofFileUri = OperationGenerator_1.default.generateRandomHash();
      const coreIndexFileBuffer = yield CoreIndexFile_1.default.createBuffer('writerLockId', provisionalIndexFileUri, coreProofFileUri, [], [recoverOperation], [deactivateOperation]);
      const coreIndexFile = yield CoreIndexFile_1.default.parse(coreIndexFileBuffer);
      const mockCoreProofFileBuffer = yield CoreProofFile_1.default.createBuffer([recoverOperation], []);
      spyOn(transactionProcessor, 'downloadFileFromCas').and.returnValue(Promise.resolve(mockCoreProofFileBuffer));
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => transactionProcessor['downloadAndVerifyCoreProofFile'](coreIndexFile), ErrorCode_1.default.CoreProofFileProofCountNotTheSameAsOperationCountInCoreIndexFile);
    }));
  });
  describe('downloadAndVerifyProvisionalProofFile()', () => {
    it('should download and parse the provisional proof file.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const [updatePublicKey, updatePrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const updateOperationData = yield OperationGenerator_1.default.generateUpdateOperation('EiBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', updatePublicKey, updatePrivateKey);
      const updateOperation = updateOperationData.updateOperation;
      const chunkFileUri = OperationGenerator_1.default.generateRandomHash();
      const provisionalProofFileUri = OperationGenerator_1.default.generateRandomHash();
      const provisionalIndexFileBuffer = yield ProvisionalIndexFile_1.default.createBuffer(chunkFileUri, provisionalProofFileUri, [updateOperation]);
      const provisionalIndexFile = yield ProvisionalIndexFile_1.default.parse(provisionalIndexFileBuffer);
      const mockProvisionalProofFileBuffer = yield ProvisionalProofFile_1.default.createBuffer([updateOperation]);
      spyOn(transactionProcessor, 'downloadFileFromCas').and.returnValue(Promise.resolve(mockProvisionalProofFileBuffer));
      const actualProcessedProvisionalProofFile = yield transactionProcessor['downloadAndVerifyProvisionalProofFile'](provisionalIndexFile);
      expect(actualProcessedProvisionalProofFile).toBeDefined();
      expect(actualProcessedProvisionalProofFile.updateProofs.length).toEqual(1);
      expect(actualProcessedProvisionalProofFile.updateProofs[0].signedDataJws).toEqual(updateOperationData.updateOperation.signedDataJws);
    }));
    it('should throw if provisional proof count is not the same as update operation count.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const [updatePublicKey, updatePrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const updateOperationData = yield OperationGenerator_1.default.generateUpdateOperation('EiBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', updatePublicKey, updatePrivateKey);
      const updateOperation = updateOperationData.updateOperation;
      const chunkFileUri = OperationGenerator_1.default.generateRandomHash();
      const provisionalProofFileUri = OperationGenerator_1.default.generateRandomHash();
      const provisionalIndexFileBuffer = yield ProvisionalIndexFile_1.default.createBuffer(chunkFileUri, provisionalProofFileUri, [updateOperation]);
      const provisionalIndexFile = yield ProvisionalIndexFile_1.default.parse(provisionalIndexFileBuffer);
      const mockProvisionalProofFileBuffer = yield ProvisionalProofFile_1.default.createBuffer([updateOperation, updateOperation]);
      spyOn(transactionProcessor, 'downloadFileFromCas').and.returnValue(Promise.resolve(mockProvisionalProofFileBuffer));
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => transactionProcessor['downloadAndVerifyProvisionalProofFile'](provisionalIndexFile), ErrorCode_1.default.ProvisionalProofFileProofCountNotTheSameAsOperationCountInProvisionalIndexFile);
    }));
  });
  describe('downloadAndVerifyChunkFile', () => {
    it('should return undefined if no provisional index file is given.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const coreIndexFile = yield FileGenerator_1.default.generateCoreIndexFile();
      const provisionalIndexFile = undefined;
      const fetchedChunkFileModel = yield transactionProcessor['downloadAndVerifyChunkFile'](coreIndexFile, provisionalIndexFile);
      expect(fetchedChunkFileModel).toBeUndefined();
      done();
    }));
    it('should throw if the delta count is different to the count of operations with delta in core and provisional index file.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const coreIndexFile = yield FileGenerator_1.default.generateCoreIndexFile();
      const provisionalIndexFile = yield FileGenerator_1.default.generateProvisionalIndexFile();
      const mockCreateOperationData = yield OperationGenerator_1.default.generateCreateOperation();
      const mockChunkFileBuffer = yield ChunkFile_1.default.createBuffer([mockCreateOperationData.createOperation], [], []);
      spyOn(transactionProcessor, 'downloadFileFromCas').and.returnValue(Promise.resolve(mockChunkFileBuffer));
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => transactionProcessor['downloadAndVerifyChunkFile'](coreIndexFile, provisionalIndexFile), ErrorCode_1.default.ChunkFileDeltaCountIncorrect);
    }));
  });
  describe('composeAnchoredOperationModels', () => {
    it('should compose operations successfully given valid anchor, map, and chunk files.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const transactionModel = {
        anchorString: 'anything',
        normalizedTransactionFee: 999,
        transactionFeePaid: 9999,
        transactionNumber: 1,
        transactionTime: 1,
        transactionTimeHash: 'anyValue',
        writer: 'anyWriter'
      };
      const createOperationData = yield OperationGenerator_1.default.generateCreateOperation();
      const createOperation = createOperationData.createOperation;
      const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const recoverOperationData = yield OperationGenerator_1.default.generateRecoverOperation({
        didUniqueSuffix: OperationGenerator_1.default.generateRandomHash(),
        recoveryPrivateKey
      });
      const recoverOperation = recoverOperationData.recoverOperation;
      const deactivateDidUniqueSuffix = OperationGenerator_1.default.generateRandomHash();
      const [, deactivatePrivateKey] = yield OperationGenerator_1.default.generateKeyPair('anyKeyId');
      const deactivateOperationData = yield OperationGenerator_1.default.createDeactivateOperation(deactivateDidUniqueSuffix, deactivatePrivateKey);
      const deactivateOperation = deactivateOperationData.deactivateOperation;
      const provisionalIndexFileUri = OperationGenerator_1.default.generateRandomHash();
      const coreProofFileUri = OperationGenerator_1.default.generateRandomHash();
      const coreIndexFileBuffer = yield CoreIndexFile_1.default.createBuffer('writerLockId', provisionalIndexFileUri, coreProofFileUri, [createOperation], [recoverOperation], [deactivateOperation]);
      const coreIndexFile = yield CoreIndexFile_1.default.parse(coreIndexFileBuffer);
      const provisionalProofFileUri = OperationGenerator_1.default.generateRandomHash();
      const updateOperationRequestData = yield OperationGenerator_1.default.generateUpdateOperationRequest();
      const updateOperation = updateOperationRequestData.updateOperation;
      const chunkFileUri = OperationGenerator_1.default.generateRandomHash();
      const provisionalIndexFileBuffer = yield ProvisionalIndexFile_1.default.createBuffer(chunkFileUri, provisionalProofFileUri, [updateOperation]);
      const provisionalIndexFile = yield ProvisionalIndexFile_1.default.parse(provisionalIndexFileBuffer);
      const coreProofFile = yield FileGenerator_1.default.createCoreProofFile([recoverOperation], [deactivateOperation]);
      const provisionalProofFile = yield FileGenerator_1.default.createProvisionalProofFile([updateOperation]);
      const chunkFileBuffer = yield ChunkFile_1.default.createBuffer([createOperation], [recoverOperation], [updateOperation]);
      const chunkFileModel = yield ChunkFile_1.default.parse(chunkFileBuffer);
      const anchoredOperationModels = yield transactionProcessor['composeAnchoredOperationModels'](transactionModel, coreIndexFile, provisionalIndexFile, coreProofFile, provisionalProofFile, chunkFileModel);
      expect(anchoredOperationModels.length).toEqual(4);
      expect(anchoredOperationModels[0].didUniqueSuffix).toEqual(createOperation.didUniqueSuffix);
      expect(anchoredOperationModels[0].operationIndex).toEqual(0);
      expect(anchoredOperationModels[0].transactionTime).toEqual(1);
      expect(anchoredOperationModels[1].didUniqueSuffix).toEqual(recoverOperation.didUniqueSuffix);
      expect(anchoredOperationModels[1].operationIndex).toEqual(1);
      expect(anchoredOperationModels[2].didUniqueSuffix).toEqual(deactivateOperation.didUniqueSuffix);
      expect(anchoredOperationModels[2].operationIndex).toEqual(2);
      expect(anchoredOperationModels[3].didUniqueSuffix).toEqual(updateOperation.didUniqueSuffix);
      expect(anchoredOperationModels[3].operationIndex).toEqual(3);
      done();
    }));
    it('should compose operations successfully given valid core index file, but no map and chunk files.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const transactionModel = {
        anchorString: 'anything',
        normalizedTransactionFee: 999,
        transactionFeePaid: 9999,
        transactionNumber: 1,
        transactionTime: 1,
        transactionTimeHash: 'anyValue',
        writer: 'anyWriter'
      };
      const createOperationData = yield OperationGenerator_1.default.generateCreateOperation();
      const createOperation = createOperationData.createOperation;
      const provisionalIndexFileUri = OperationGenerator_1.default.generateRandomHash();
      const coreProofFileUri = undefined;
      const coreIndexFileBuffer = yield CoreIndexFile_1.default.createBuffer('writerLockId', provisionalIndexFileUri, coreProofFileUri, [createOperation], [], []);
      const coreIndexFile = yield CoreIndexFile_1.default.parse(coreIndexFileBuffer);
      const anchoredOperationModels = yield transactionProcessor['composeAnchoredOperationModels'](transactionModel, coreIndexFile, undefined, undefined, undefined, undefined);
      expect(anchoredOperationModels.length).toEqual(1);
      expect(anchoredOperationModels[0].didUniqueSuffix).toEqual(createOperation.didUniqueSuffix);
      expect(anchoredOperationModels[0].operationIndex).toEqual(0);
      expect(anchoredOperationModels[0].transactionTime).toEqual(1);
      done();
    }));
    it('should succeed with deltas being set to `undefined` if chunk file is not given.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const transactionModel = {
        anchorString: 'anything',
        normalizedTransactionFee: 999,
        transactionFeePaid: 9999,
        transactionNumber: 1,
        transactionTime: 1,
        transactionTimeHash: 'anyValue',
        writer: 'anyWriter'
      };
      const [, anyPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const recoverOperationData = yield OperationGenerator_1.default.generateRecoverOperation({ didUniqueSuffix: OperationGenerator_1.default.generateRandomHash(), recoveryPrivateKey: anyPrivateKey });
      const recoverOperation = recoverOperationData.recoverOperation;
      const provisionalIndexFileUri = OperationGenerator_1.default.generateRandomHash();
      const coreProofFileUri = OperationGenerator_1.default.generateRandomHash();
      const coreIndexFileBuffer = yield CoreIndexFile_1.default.createBuffer('writerLockId', provisionalIndexFileUri, coreProofFileUri, [], [recoverOperation], []);
      const coreIndexFile = yield CoreIndexFile_1.default.parse(coreIndexFileBuffer);
      const provisionalProofFileUri = OperationGenerator_1.default.generateRandomHash();
      const updateOperationRequestData = yield OperationGenerator_1.default.generateUpdateOperationRequest();
      const updateOperation = updateOperationRequestData.updateOperation;
      const chunkFileUri = OperationGenerator_1.default.generateRandomHash();
      const provisionalIndexFileBuffer = yield ProvisionalIndexFile_1.default.createBuffer(chunkFileUri, provisionalProofFileUri, [updateOperation]);
      const provisionalIndexFile = yield ProvisionalIndexFile_1.default.parse(provisionalIndexFileBuffer);
      const coreProofFile = yield FileGenerator_1.default.createCoreProofFile([recoverOperation], []);
      const provisionalProofFile = yield FileGenerator_1.default.createProvisionalProofFile([updateOperation]);
      const anchoredOperationModels = yield transactionProcessor['composeAnchoredOperationModels'](transactionModel, coreIndexFile, provisionalIndexFile, coreProofFile, provisionalProofFile, undefined);
      expect(anchoredOperationModels.length).toEqual(2);
      const composedRecoverRequest = JSON.parse(anchoredOperationModels[0].operationBuffer.toString());
      const composedUpdateRequest = JSON.parse(anchoredOperationModels[1].operationBuffer.toString());
      expect(composedRecoverRequest.didSuffix).toEqual(recoverOperation.didUniqueSuffix);
      expect(composedUpdateRequest.didSuffix).toEqual(updateOperation.didUniqueSuffix);
      expect(composedRecoverRequest.delta).toBeUndefined();
      expect(composedUpdateRequest.delta).toBeUndefined();
    }));
  });
});
// # sourceMappingURL=TransactionProcessor.spec.js.map
