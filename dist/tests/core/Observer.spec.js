'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const retry = require('async-retry');
const AnchoredDataSerializer_1 = require('../../lib/core/versions/latest/AnchoredDataSerializer');
const Blockchain_1 = require('../../lib/core/Blockchain');
const ChunkFile_1 = require('../../lib/core/versions/latest/ChunkFile');
const CoreIndexFile_1 = require('../../lib/core/versions/latest/CoreIndexFile');
const DownloadManager_1 = require('../../lib/core/DownloadManager');
const SharedErrorCode_1 = require('../../lib/common/SharedErrorCode');
const FetchResultCode_1 = require('../../lib/common/enums/FetchResultCode');
const Ipfs_1 = require('../../lib/ipfs/Ipfs');
const Logger_1 = require('../../lib/common/Logger');
const MockConfirmationStore_1 = require('../mocks/MockConfirmationStore');
const MockOperationStore_1 = require('../mocks/MockOperationStore');
const MockTransactionStore_1 = require('../mocks/MockTransactionStore');
const MockVersionManager_1 = require('../mocks/MockVersionManager');
const Observer_1 = require('../../lib/core/Observer');
const OperationGenerator_1 = require('../generators/OperationGenerator');
const ProvisionalIndexFile_1 = require('../../lib/core/versions/latest/ProvisionalIndexFile');
const SidetreeError_1 = require('../../lib/common/SidetreeError');
const TransactionUnderProcessingModel_1 = require('../../lib/core/models/TransactionUnderProcessingModel');
const TransactionProcessor_1 = require('../../lib/core/versions/latest/TransactionProcessor');
const TransactionSelector_1 = require('../../lib/core/versions/latest/TransactionSelector');
describe('Observer', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  const config = require('../json/config-test.json');
  let observer;
  let blockchainClient;
  let casClient;
  let downloadManager;
  let operationStore;
  let transactionStore;
  let versionManager;
  let getTransactionProcessorSpy;
  let transactionProcessor;
  const originalDefaultTestTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  beforeAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  }));
  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalDefaultTestTimeout;
  });
  beforeEach(() => {
    const fetchTimeoutInSeconds = 1;
    casClient = new Ipfs_1.default('unusedUri', fetchTimeoutInSeconds);
    spyOn(casClient, 'read').and.returnValue(Promise.resolve({ code: FetchResultCode_1.default.NotFound }));
    blockchainClient = new Blockchain_1.default(config.blockchainServiceUri);
    operationStore = new MockOperationStore_1.default();
    transactionStore = new MockTransactionStore_1.default();
    downloadManager = new DownloadManager_1.default(config.maxConcurrentDownloads, casClient);
    downloadManager.start();
    const versionMetadataFetcher = {};
    spyOn(blockchainClient, 'getValueTimeLock').and.returnValue(Promise.resolve(undefined));
    transactionProcessor = new TransactionProcessor_1.default(downloadManager, operationStore, blockchainClient, versionMetadataFetcher);
    const transactionSelector = new TransactionSelector_1.default(transactionStore);
    versionManager = new MockVersionManager_1.default();
    getTransactionProcessorSpy = spyOn(versionManager, 'getTransactionProcessor');
    getTransactionProcessorSpy.and.returnValue(transactionProcessor);
    spyOn(versionManager, 'getTransactionSelector').and.returnValue(transactionSelector);
    observer = new Observer_1.default(versionManager, blockchainClient, config.maxConcurrentDownloads, operationStore, transactionStore, transactionStore, new MockConfirmationStore_1.default(), 1);
  });
  describe('waitUntilCountOfTransactionsUnderProcessingIsLessOrEqualTo', () => {
    it('should wait until transaction under processing count is 0.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const transactionsUnderProcessing = [1, 2, 3];
      const getCountOfTransactionsUnderProcessingSpy = spyOn(Observer_1.default, 'getCountOfTransactionsUnderProcessing').and.returnValues(2, 0);
      const startTime = Date.now();
      yield Observer_1.default['waitUntilCountOfTransactionsUnderProcessingIsLessOrEqualTo'](transactionsUnderProcessing, 0);
      const endTime = Date.now();
      expect(getCountOfTransactionsUnderProcessingSpy).toHaveBeenCalledTimes(2);
      expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
    }));
  });
  describe('processTransactions', () => {
    it('should set `transactionsUnderProcessing` to an empty array when a transaction processing has failed with an Error status.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      observer['transactionsUnderProcessing'] = [{
        processingStatus: TransactionUnderProcessingModel_1.TransactionProcessingStatus.Processing,
        transaction: undefined
      }];
      expect(observer['transactionsUnderProcessing'].length).toEqual(1);
      spyOn(observer['blockchain'], 'read').and.returnValue(Promise.resolve({
        moreTransactions: false,
        transactions: []
      }));
      spyOn(observer['throughputLimiter'], 'getQualifiedTransactions').and.returnValue(Promise.resolve([
        {
          anchorString: 'unused',
          transactionFeePaid: 1,
          transactionNumber: 1,
          transactionTime: 1,
          transactionTimeHash: 'unused',
          writer: 'unused'
        }
      ]));
      spyOn(transactionProcessor, 'processTransaction').and.throwError('Any error to trigger code to save transaction data for retry later.');
      const recordUnresolvableTransactionFetchAttemptSpy = spyOn(observer['unresolvableTransactionStore'], 'recordUnresolvableTransactionFetchAttempt').and.throwError('Error that prevents transaction processing from advancing.');
      spyOn(Observer_1.default, 'waitUntilCountOfTransactionsUnderProcessingIsLessOrEqualTo');
      yield observer['processTransactions']();
      expect(recordUnresolvableTransactionFetchAttemptSpy).toHaveBeenCalledTimes(1);
      expect(observer['transactionsUnderProcessing']).toEqual([]);
    }));
  });
  it('should record transactions processed with expected outcome.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const initialTransactionFetchResponseBody = {
      moreTransactions: false,
      transactions: [
        {
          transactionNumber: 1,
          transactionTime: 1000,
          transactionTimeHash: '1000',
          anchorString: '1stTransaction',
          transactionFeePaid: 1,
          normalizedTransactionFee: 1,
          writer: 'writer1'
        },
        {
          transactionNumber: 2,
          transactionTime: 1000,
          transactionTimeHash: '1000',
          anchorString: '2ndTransaction',
          transactionFeePaid: 2,
          normalizedTransactionFee: 2,
          writer: 'writer2'
        }
      ]
    };
    const subsequentTransactionFetchResponseBody = {
      moreTransactions: false,
      transactions: []
    };
    let readInvocationCount = 0;
    const mockReadFunction = () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      readInvocationCount++;
      if (readInvocationCount === 1) {
        return initialTransactionFetchResponseBody;
      } else {
        return subsequentTransactionFetchResponseBody;
      }
    });
    spyOn(blockchainClient, 'read').and.callFake(mockReadFunction);
    spyOn(observer['throughputLimiter'], 'getQualifiedTransactions').and.callFake((transactions) => {
      return new Promise((resolve) => { resolve(transactions); });
    });
    const processedTransactions = transactionStore.getTransactions();
    yield observer.startPeriodicProcessing();
    yield retry((_bail) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const processedTransactionCount = transactionStore.getTransactions().length;
      if (processedTransactionCount === 2) {
        return;
      }
      throw new Error('Incorrect number of changes to the processed transactions list.');
    }), {
      retries: 10,
      minTimeout: 500,
      maxTimeout: 500
    });
    observer.stopPeriodicProcessing();
    expect(processedTransactions.length).toEqual(2);
    expect(processedTransactions[0].anchorString).toEqual('1stTransaction');
    expect(processedTransactions[1].anchorString).toEqual('2ndTransaction');
  }));
  it('should process a valid operation batch successfully.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const operation1Data = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 1, transactionNumber: 1, operationIndex: 1 });
    const operation2Data = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 1, transactionNumber: 1, operationIndex: 2 });
    const createOperations = [operation1Data.createOperation, operation2Data.createOperation];
    const coreProofFileUri = undefined;
    const mockChunkFileBuffer = yield ChunkFile_1.default.createBuffer(createOperations, [], []);
    const mockChunkFileFetchResult = {
      code: FetchResultCode_1.default.Success,
      content: mockChunkFileBuffer
    };
    const mockChunkFileUri = 'MockChunkFileUri';
    const mockProvisionalProofFileUri = undefined;
    const mockProvisionalIndexFileBuffer = yield ProvisionalIndexFile_1.default.createBuffer(mockChunkFileUri, mockProvisionalProofFileUri, []);
    const mockProvisionalIndexFileUri = 'MockProvisionalIndexFileUri';
    const mockProvisionalIndexFileFetchResult = {
      code: FetchResultCode_1.default.Success,
      content: mockProvisionalIndexFileBuffer
    };
    const mockCoreIndexFileBuffer = yield CoreIndexFile_1.default.createBuffer('writerLock', mockProvisionalIndexFileUri, coreProofFileUri, createOperations, [], []);
    const mockAnchoredFileFetchResult = {
      code: FetchResultCode_1.default.Success,
      content: mockCoreIndexFileBuffer
    };
    const mockCoreIndexFileUri = 'MockCoreIndexFileUri';
    const mockDownloadFunction = (hash) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      if (hash === mockCoreIndexFileUri) {
        return mockAnchoredFileFetchResult;
      } else if (hash === mockProvisionalIndexFileUri) {
        return mockProvisionalIndexFileFetchResult;
      } else if (hash === mockChunkFileUri) {
        return mockChunkFileFetchResult;
      } else {
        throw new Error('Test failed, unexpected hash given');
      }
    });
    spyOn(downloadManager, 'download').and.callFake(mockDownloadFunction);
    const anchoredData = AnchoredDataSerializer_1.default.serialize({ coreIndexFileUri: mockCoreIndexFileUri, numberOfOperations: createOperations.length });
    const mockTransaction = {
      transactionNumber: 1,
      transactionTime: 1000000,
      transactionTimeHash: '1000',
      anchorString: anchoredData,
      transactionFeePaid: 1,
      normalizedTransactionFee: 1,
      writer: 'writer'
    };
    const transactionUnderProcessing = {
      transaction: mockTransaction,
      processingStatus: 'pending'
    };
    yield observer.processTransaction(mockTransaction, transactionUnderProcessing);
    const didUniqueSuffixes = createOperations.map(operation => operation.didUniqueSuffix);
    for (const didUniqueSuffix of didUniqueSuffixes) {
      const operationArray = yield operationStore.get(didUniqueSuffix);
      expect(operationArray.length).toEqual(1);
    }
  }));
  const invalidCoreIndexFileTestsInput = [
    [FetchResultCode_1.default.MaxSizeExceeded, 'exceeded max size limit'],
    [FetchResultCode_1.default.NotAFile, 'is not a file'],
    [FetchResultCode_1.default.InvalidHash, 'is not a valid hash']
  ];
  for (const tuple of invalidCoreIndexFileTestsInput) {
    const mockFetchReturnCode = tuple[0];
    const expectedConsoleLogSubstring = tuple[1];
    it(`should stop processing a transaction if downloading core index files returns '${mockFetchReturnCode}'.`, () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      spyOn(downloadManager, 'download').and.returnValue(Promise.resolve({ code: mockFetchReturnCode }));
      let expectedConsoleLogDetected = false;
      spyOn(Logger_1.default, 'info').and.callFake((message) => {
        if (message.includes(expectedConsoleLogSubstring)) {
          expectedConsoleLogDetected = true;
        }
      });
      spyOn(transactionStore, 'removeUnresolvableTransaction');
      spyOn(transactionStore, 'recordUnresolvableTransactionFetchAttempt');
      const anchoredData = AnchoredDataSerializer_1.default.serialize({ coreIndexFileUri: 'EiA_psBVqsuGjoYXMIRrcW_mPUG1yDXbh84VPXOuVQ5oqw', numberOfOperations: 1 });
      const mockTransaction = {
        transactionNumber: 1,
        transactionTime: 1000000,
        transactionTimeHash: '1000',
        anchorString: anchoredData,
        transactionFeePaid: 1,
        normalizedTransactionFee: 1,
        writer: 'writer'
      };
      const transactionUnderProcessing = {
        transaction: mockTransaction,
        processingStatus: 'pending'
      };
      yield observer.processTransaction(mockTransaction, transactionUnderProcessing);
      expect(expectedConsoleLogDetected).toBeTruthy();
      expect(transactionStore.removeUnresolvableTransaction).toHaveBeenCalled();
      expect(transactionStore.recordUnresolvableTransactionFetchAttempt).not.toHaveBeenCalled();
    }));
  }
  it('should detect and handle block reorganization correctly.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const initialTransactionFetchResponseBody = {
      moreTransactions: false,
      transactions: [
        {
          transactionNumber: 1,
          transactionTime: 1000,
          transactionTimeHash: '1000',
          anchorString: '1stTransaction',
          transactionFeePaid: 1,
          normalizedTransactionFee: 1,
          writer: 'writer1'
        },
        {
          transactionNumber: 2,
          transactionTime: 2000,
          transactionTimeHash: '2000',
          anchorString: '2ndTransaction',
          transactionFeePaid: 1,
          normalizedTransactionFee: 1,
          writer: 'writer2'
        },
        {
          transactionNumber: 3,
          transactionTime: 3000,
          transactionTimeHash: '3000',
          anchorString: '3rdTransaction',
          transactionFeePaid: 1,
          normalizedTransactionFee: 1,
          writer: 'writer3'
        }
      ]
    };
    const transactionFetchResponseBodyAfterBlockReorg = {
      moreTransactions: false,
      transactions: [
        {
          transactionNumber: 2,
          transactionTime: 2001,
          transactionTimeHash: '2001',
          anchorString: '2ndTransactionNew',
          transactionFeePaid: 1,
          normalizedTransactionFee: 1,
          writer: 'writer1'
        },
        {
          transactionNumber: 3,
          transactionTime: 3001,
          transactionTimeHash: '3000',
          anchorString: '3rdTransactionNew',
          transactionFeePaid: 1,
          normalizedTransactionFee: 1,
          writer: 'writer2'
        },
        {
          transactionNumber: 4,
          transactionTime: 4000,
          transactionTimeHash: '4000',
          anchorString: '4thTransaction',
          transactionFeePaid: 1,
          normalizedTransactionFee: 1,
          writer: 'writer3'
        }
      ]
    };
    const subsequentTransactionFetchResponseBody = {
      moreTransactions: false,
      transactions: []
    };
    spyOn(blockchainClient, 'getLatestTime').and.returnValue(Promise.resolve({ time: 5000, hash: '5000' }));
    const confirmSpy = spyOn(observer['confirmationStore'], 'confirm');
    const resetSpy = spyOn(observer['confirmationStore'], 'resetAfter');
    let readInvocationCount = 0;
    const mockReadFunction = () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      readInvocationCount++;
      if (readInvocationCount === 1) {
        return initialTransactionFetchResponseBody;
      }
      if (readInvocationCount === 2) {
        throw new SidetreeError_1.default(SharedErrorCode_1.default.InvalidTransactionNumberOrTimeHash);
      }
      if (readInvocationCount === 3) {
        return transactionFetchResponseBodyAfterBlockReorg;
      } else {
        return subsequentTransactionFetchResponseBody;
      }
    });
    spyOn(blockchainClient, 'read').and.callFake(mockReadFunction);
    spyOn(blockchainClient, 'getFirstValidTransaction').and.returnValue(Promise.resolve(initialTransactionFetchResponseBody.transactions[0]));
    spyOn(observer['throughputLimiter'], 'getQualifiedTransactions').and.callFake((transactions) => {
      return new Promise((resolve) => { resolve(transactions); });
    });
    yield observer.startPeriodicProcessing();
    const processedTransactions = transactionStore.getTransactions();
    yield retry((_bail) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const processedTransactionCount = processedTransactions.length;
      if (processedTransactionCount === 4) {
        return;
      }
      throw new Error('Block reorganization not handled.');
    }), {
      retries: 10,
      minTimeout: 1000,
      maxTimeout: 1000
    });
    expect(processedTransactions.length).toEqual(4);
    expect(processedTransactions[0].anchorString).toEqual('1stTransaction');
    expect(processedTransactions[1].anchorString).toEqual('2ndTransactionNew');
    expect(processedTransactions[2].anchorString).toEqual('3rdTransactionNew');
    expect(processedTransactions[3].anchorString).toEqual('4thTransaction');
    expect(confirmSpy.calls.allArgs()).toEqual([
      ['1stTransaction', 1000],
      ['2ndTransaction', 2000],
      ['3rdTransaction', 3000],
      ['2ndTransactionNew', 2001],
      ['3rdTransactionNew', 3001],
      ['4thTransaction', 4000]
    ]);
    expect(resetSpy.calls.allArgs()).toEqual([
      [1000]
    ]);
  }));
  it('should log error if blockchain throws', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    let readInvocationCount = 0;
    spyOn(blockchainClient, 'read').and.callFake(() => {
      readInvocationCount++;
      throw new Error('Expected test error');
    });
    const loggerErrorSpy = spyOn(Logger_1.default, 'error').and.callThrough();
    spyOn(observer['throughputLimiter'], 'getQualifiedTransactions').and.callFake((transactions) => {
      return new Promise((resolve) => { resolve(transactions); });
    });
    yield observer.startPeriodicProcessing();
    observer.stopPeriodicProcessing();
    yield retry((_bail) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      if (readInvocationCount > 0) {
        return;
      }
      throw new Error('Two transaction processing cycles have not occurred yet.');
    }), {
      retries: 3,
      minTimeout: 1000,
      maxTimeout: 1000
    });
    expect(loggerErrorSpy).toHaveBeenCalledWith('Encountered unhandled and possibly fatal Observer error, must investigate and fix:');
    expect(loggerErrorSpy).toHaveBeenCalledWith(new Error('Expected test error'));
  }));
  it('should not rollback if blockchain time in bitcoin service is behind core service.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const anchoredData = AnchoredDataSerializer_1.default.serialize({ coreIndexFileUri: '1stTransaction', numberOfOperations: 1 });
    const transaction = {
      transactionNumber: 1,
      transactionTime: 1000,
      transactionTimeHash: '1000',
      anchorString: anchoredData,
      transactionFeePaid: 1,
      normalizedTransactionFee: 1,
      writer: 'writer'
    };
    yield transactionStore.addTransaction(transaction);
    spyOn(blockchainClient, 'getLatestTime').and.returnValue(Promise.resolve({ time: 500, hash: '500' }));
    let readInvocationCount = 0;
    const mockReadFunction = (sinceTransactionNumber, transactionTimeHash) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      readInvocationCount++;
      expect(sinceTransactionNumber).toEqual(1);
      expect(transactionTimeHash).toEqual('1000');
      throw new SidetreeError_1.default(SharedErrorCode_1.default.InvalidTransactionNumberOrTimeHash);
    });
    spyOn(blockchainClient, 'read').and.callFake(mockReadFunction);
    const getFirstValidTransactionSpy = spyOn(blockchainClient, 'getFirstValidTransaction').and.returnValue(Promise.resolve(undefined));
    const revertInvalidTransactionsSpy = spyOn(observer, 'revertInvalidTransactions').and.returnValue(Promise.resolve(undefined));
    yield observer.startPeriodicProcessing();
    yield retry((_bail) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      if (readInvocationCount >= 2) {
        return;
      }
      throw new Error('Two transaction processing cycles have not occurred yet.');
    }), {
      retries: 3,
      minTimeout: 1000,
      maxTimeout: 1000
    });
    expect(revertInvalidTransactionsSpy).toHaveBeenCalledTimes(0);
    expect(getFirstValidTransactionSpy).toHaveBeenCalledTimes(0);
  }));
  describe('processUnresolvableTransactions', () => {
    it('should process unresolvable transactions as expected', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const isIndividualResolved = [false, false, false];
      spyOn(observer['unresolvableTransactionStore'], 'getUnresolvableTransactionsDueForRetry').and.returnValue([1, 2, 3]);
      spyOn(observer, 'processTransaction').and.callFake((transaction, awaitingTransaction) => {
        awaitingTransaction.processingStatus = TransactionUnderProcessingModel_1.TransactionProcessingStatus.Processed;
        isIndividualResolved[transaction - 1] = true;
      });
      yield observer['processUnresolvableTransactions']();
      expect(isIndividualResolved[0]).toBeTruthy();
      expect(isIndividualResolved[1]).toBeTruthy();
      expect(isIndividualResolved[2]).toBeTruthy();
    }));
  });
  describe('processTransaction', () => {
    it('should handle unexpected error', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      getTransactionProcessorSpy.and.throwError('Expected test error');
      const recordUnresolvableAttemptSpy = spyOn(observer['unresolvableTransactionStore'], 'recordUnresolvableTransactionFetchAttempt');
      const confirmSpy = spyOn(observer['confirmationStore'], 'confirm');
      yield observer['processTransaction']({}, {});
      expect(recordUnresolvableAttemptSpy).toHaveBeenCalled();
      expect(confirmSpy).toHaveBeenCalled();
    }));
  });
  describe('revertInvalidTransactions', () => {
    it('should delete all operations if last known valid transaction does not exist', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      spyOn(transactionStore, 'getExponentiallySpacedTransactions').and.returnValue(Promise.resolve([]));
      spyOn(transactionStore, 'getTransactionsLaterThan').and.returnValue(Promise.resolve([]));
      spyOn(blockchainClient, 'getFirstValidTransaction').and.returnValue(Promise.resolve(undefined));
      const operationStoreDelteSpy = spyOn(observer['operationStore'], 'delete').and.returnValue(Promise.resolve());
      const transactionStoreDelteSpy = spyOn(observer['transactionStore'], 'removeTransactionsLaterThan').and.returnValue(Promise.resolve());
      const unresolvableTransactionStoreDelteSpy = spyOn(observer['unresolvableTransactionStore'], 'removeUnresolvableTransactionsLaterThan').and.returnValue(Promise.resolve());
      yield observer['revertInvalidTransactions']();
      expect(operationStoreDelteSpy).toHaveBeenCalledWith(undefined);
      expect(transactionStoreDelteSpy).toHaveBeenCalledWith(undefined);
      expect(unresolvableTransactionStoreDelteSpy).toHaveBeenCalledWith(undefined);
    }));
  });
}));
// # sourceMappingURL=Observer.spec.js.map
