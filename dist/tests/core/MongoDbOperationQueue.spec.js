'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const ErrorCode_1 = require('../../lib/core/versions/latest/ErrorCode');
const MongoDb_1 = require('../common/MongoDb');
const MongoDbOperationQueue_1 = require('../../lib/core/versions/latest/MongoDbOperationQueue');
const SidetreeError_1 = require('../../lib/common/SidetreeError');
function createOperationQueue (storeUri, databaseName) {
  return tslib_1.__awaiter(this, void 0, void 0, function * () {
    const operationQueue = new MongoDbOperationQueue_1.default(storeUri, databaseName);
    yield operationQueue.initialize();
    return operationQueue;
  });
}
function generateAndQueueOperations (operationQueue, count) {
  return tslib_1.__awaiter(this, void 0, void 0, function * () {
    const operations = [];
    for (let i = 1; i <= count; i++) {
      const didUniqueSuffix = i.toString();
      const operationBuffer = Buffer.from(didUniqueSuffix);
      operations.push({ didUniqueSuffix, operationBuffer });
      yield operationQueue.enqueue(didUniqueSuffix, operationBuffer);
    }
    return operations;
  });
}
describe('MongoDbOperationQueue', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  const config = require('../json/config-test.json');
  const databaseName = 'sidetree-test';
  let operationQueue;
  beforeAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    yield MongoDb_1.default.createInmemoryDb(config);
    operationQueue = yield createOperationQueue(config.mongoDbConnectionString, databaseName);
  }));
  beforeEach(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    yield operationQueue.clearCollection();
  }));
  it('should peek with correct count.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const operationCount = 3;
    const queuedOperations = yield generateAndQueueOperations(operationQueue, operationCount);
    let peekedOperations = yield operationQueue.peek(0);
    expect(peekedOperations).not.toBeNull();
    expect(peekedOperations.length).toBe(0);
    for (let i = 0; i < 5; i++) {
      peekedOperations = yield operationQueue.peek(2);
      expect(peekedOperations.length).toEqual(2);
      expect(peekedOperations[0].operationBuffer).toEqual(queuedOperations[0].operationBuffer);
      expect(peekedOperations[1].operationBuffer).toEqual(queuedOperations[1].operationBuffer);
    }
  }));
  it('should dequeue with correct count.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const operationCount = 3;
    const queuedOperations = yield generateAndQueueOperations(operationQueue, operationCount);
    let dequeuedOperations = yield operationQueue.dequeue(0);
    expect(dequeuedOperations).not.toBeNull();
    expect(dequeuedOperations.length).toBe(0);
    dequeuedOperations = yield operationQueue.dequeue(2);
    const remainingOperations = yield operationQueue.peek(operationCount);
    expect(dequeuedOperations.length).toEqual(2);
    expect(dequeuedOperations[0].operationBuffer).toEqual(queuedOperations[0].operationBuffer);
    expect(dequeuedOperations[1].operationBuffer).toEqual(queuedOperations[1].operationBuffer);
    expect(remainingOperations.length).toEqual(1);
    expect(remainingOperations[0].operationBuffer).toEqual(queuedOperations[2].operationBuffer);
  }));
  it('should check if an operation of the given DID unique suffix exists correctly.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const operationCount = 3;
    yield generateAndQueueOperations(operationQueue, operationCount);
    for (let i = 1; i <= operationCount; i++) {
      const operationExists = yield operationQueue.contains(i.toString());
      expect(operationExists).toBeTruthy();
    }
    const operationExists = yield operationQueue.contains('non-existent-did-unique-suffix');
    expect(operationExists).toBeFalsy();
  }));
  it('should throw SidetreeError with code when enqueueing more than 1 operation for DID.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const operationCount = 3;
    yield generateAndQueueOperations(operationQueue, operationCount);
    spyOn(operationQueue.collection, 'insertOne').and.callFake(() => {
      const error = new Error(ErrorCode_1.default.BatchWriterAlreadyHasOperationForDid);
      error['code'] = 11000;
      throw error;
    });
    try {
      yield generateAndQueueOperations(operationQueue, operationCount);
    } catch (error) {
      if (error instanceof SidetreeError_1.default &&
                error.code === ErrorCode_1.default.BatchWriterAlreadyHasOperationForDid) {
      } else {
        throw error;
      }
    }
  }));
  it('should throw original error if unexpected error is thrown when enqueuing.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    spyOn(operationQueue.collection, 'insertOne').and.callFake(() => {
      const error = new Error(ErrorCode_1.default.BatchWriterAlreadyHasOperationForDid);
      error['code'] = 'unexpected-error';
      throw error;
    });
    try {
      yield generateAndQueueOperations(operationQueue, 1);
    } catch (error) {
      if (error.code === 'unexpected-error') {
      } else {
        throw error;
      }
    }
  }));
  it('should get queue size correctly.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const operationCount = 3;
    yield generateAndQueueOperations(operationQueue, operationCount);
    const size = yield operationQueue.getSize();
    expect(size).toEqual(3);
  }));
}));
// # sourceMappingURL=MongoDbOperationQueue.spec.js.map
