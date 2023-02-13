'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const BatchWriter_1 = require('../../lib/core/versions/latest/BatchWriter');
const lib_1 = require('../../lib');
describe('Monitor', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  const testConfig = require('../json/config-test.json');
  describe('getOperationQueueSize()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should get operation queue size correctly.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const monitor = new lib_1.SidetreeMonitor(testConfig, {}, {});
      const operationQueueInitializeSpy = spyOn(monitor.operationQueue, 'initialize');
      const transactionStoreInitializeSpy = spyOn(monitor.transactionStore, 'initialize');
      yield monitor.initialize();
      expect(operationQueueInitializeSpy).toHaveBeenCalledTimes(1);
      expect(transactionStoreInitializeSpy).toHaveBeenCalledTimes(1);
    }));
  }));
  describe('getOperationQueueSize()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should get operation queue size correctly.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const monitor = new lib_1.SidetreeMonitor(testConfig, {}, {});
      spyOn(monitor.operationQueue, 'getSize').and.returnValue(Promise.resolve(300));
      const output = yield monitor.getOperationQueueSize();
      expect(output).toEqual({ operationQueueSize: 300 });
    }));
  }));
  describe('getWriterMaxBatchSize()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should get writer max batch size correctly.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const monitor = new lib_1.SidetreeMonitor(testConfig, {}, {});
      monitor.blockchain = { getWriterValueTimeLock: () => { } };
      spyOn(monitor.blockchain, 'getWriterValueTimeLock');
      spyOn(BatchWriter_1.default, 'getNumberOfOperationsAllowed').and.returnValue(1000);
      const output = yield monitor.getWriterMaxBatchSize();
      expect(output).toEqual({ writerMaxBatchSize: 1000 });
    }));
  }));
  describe('getLastTransaction()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should get last processed transaction correctly.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const mockTransaction = {
        anchorString: 'anyAnchor',
        transactionFeePaid: 1,
        transactionNumber: 1,
        transactionTime: 1,
        transactionTimeHash: 'anyHash',
        writer: 'anyWriter',
        normalizedTransactionFee: 1
      };
      const monitor = new lib_1.SidetreeMonitor(testConfig, {}, {});
      spyOn(monitor.transactionStore, 'getLastTransaction').and.returnValue(Promise.resolve(mockTransaction));
      const output = yield monitor.getLastProcessedTransaction();
      expect(output).toEqual(mockTransaction);
    }));
  }));
}));
// # sourceMappingURL=Monitor.spec.js.map
