'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
class MockOperationQueue {
  constructor () {
    this.latestTimestamp = 0;
    this.operations = new Map();
  }

  enqueue (didUniqueSuffix, operationBuffer) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      this.latestTimestamp++;
      this.operations.set(didUniqueSuffix, [this.latestTimestamp, operationBuffer]);
    });
  }

  dequeue (count) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const sortedEntries = Array.from(this.operations.entries()).sort((a, b) => a[1][0] - b[1][0]);
      const sortedQueuedOperations = sortedEntries.map(entry => {
        return { didUniqueSuffix: entry[0], operationBuffer: entry[1][1] };
      });
      const sortedKeys = sortedEntries.map(entry => entry[0]);
      const keyBatch = sortedKeys.slice(0, count);
      keyBatch.forEach((key) => this.operations.delete(key));
      const operationBatch = sortedQueuedOperations.slice(0, count);
      return operationBatch;
    });
  }

  peek (count) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const sortedEntries = Array.from(this.operations.entries()).sort((a, b) => a[1][0] - b[1][0]);
      const sortedQueuedOperations = sortedEntries.map(entry => {
        return { didUniqueSuffix: entry[0], operationBuffer: entry[1][1] };
      });
      const operationBatch = sortedQueuedOperations.slice(0, count);
      return operationBatch;
    });
  }

  contains (didUniqueSuffix) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      return this.operations.has(didUniqueSuffix);
    });
  }

  getSize () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      return this.operations.size;
    });
  }
}
exports.default = MockOperationQueue;
// # sourceMappingURL=MockOperationQueue.js.map
