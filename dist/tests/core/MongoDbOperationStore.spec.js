'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const JsObject_1 = require('../../lib/core/versions/latest/util/JsObject');
const mongodb_1 = require('mongodb');
const MongoDb_1 = require('../common/MongoDb');
const MongoDbOperationStore_1 = require('../../lib/core/MongoDbOperationStore');
const Multihash_1 = require('../../lib/core/versions/latest/Multihash');
const OperationGenerator_1 = require('../generators/OperationGenerator');
const UpdateOperation_1 = require('../../lib/core/versions/latest/UpdateOperation');
const databaseName = 'sidetree-test';
function createOperationStore (mongoDbConnectionString) {
  return tslib_1.__awaiter(this, void 0, void 0, function * () {
    const operationStore = new MongoDbOperationStore_1.default(mongoDbConnectionString, databaseName);
    yield operationStore.initialize();
    return operationStore;
  });
}
function createOperationChain (createOperation, chainLength, signingKey, signingPrivateKey, transactionNumber) {
  return tslib_1.__awaiter(this, void 0, void 0, function * () {
    const didUniqueSuffix = createOperation.didUniqueSuffix;
    const chain = new Array(createOperation);
    let currentPublicKey = signingKey;
    let currentPrivateKey = signingPrivateKey;
    for (let i = 1; i < chainLength; i++) {
      const transactionNumberToUse = transactionNumber || i;
      const transactionTimeToUse = transactionNumberToUse;
      const [newPublicKey, newPrivateKey] = yield OperationGenerator_1.default.generateKeyPair(`key${i}`);
      const operationRequest = yield OperationGenerator_1.default.createUpdateOperationRequestForAddingAKey(didUniqueSuffix, currentPublicKey.publicKeyJwk, currentPrivateKey, newPublicKey, Multihash_1.default.canonicalizeThenDoubleHashThenEncode(newPublicKey.publicKeyJwk));
      currentPublicKey = newPublicKey;
      currentPrivateKey = newPrivateKey;
      const operationModel = yield UpdateOperation_1.default.parse(Buffer.from(JSON.stringify(operationRequest)));
      const anchoredOperation = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(operationModel, transactionTimeToUse, transactionNumberToUse, i);
      chain.push(anchoredOperation);
    }
    return chain;
  });
}
function checkEqual (operation1, operation2) {
  expect(operation1.transactionNumber).toBeDefined();
  expect(operation2.transactionNumber).toBeDefined();
  expect(operation1.transactionNumber).toEqual(operation2.transactionNumber);
  expect(operation1.operationIndex).toBeDefined();
  expect(operation2.operationIndex).toBeDefined();
  expect(operation1.operationIndex).toEqual(operation2.operationIndex);
  expect(operation1.transactionTime).toBeDefined();
  expect(operation2.transactionTime).toBeDefined();
  expect(operation1.transactionTime).toEqual(operation2.transactionTime);
  expect(operation1.didUniqueSuffix).toEqual(operation2.didUniqueSuffix);
  expect(operation1.type).toEqual(operation2.type);
  expect(operation1.operationBuffer).toEqual(operation2.operationBuffer);
}
function checkEqualArray (putOperations, gotOperations) {
  expect(gotOperations.length).toEqual(putOperations.length);
  for (let i = 0; i < putOperations.length; i++) {
    checkEqual(gotOperations[i], putOperations[i]);
  }
}
describe('MongoDbOperationStore', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  let operationStore;
  const config = require('../json/config-test.json');
  beforeAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    yield MongoDb_1.default.createInmemoryDb(config);
    operationStore = yield createOperationStore(config.mongoDbConnectionString);
  }));
  beforeEach(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    yield operationStore.delete();
  }));
  it('should create collection when initialize is called', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const databaseName = 'test-new-db';
    const emptyOperationStore = new MongoDbOperationStore_1.default(config.mongoDbConnectionString, databaseName);
    yield emptyOperationStore.initialize();
    const client = yield mongodb_1.MongoClient.connect(config.mongoDbConnectionString, { useNewUrlParser: true });
    const db = client.db(databaseName);
    const collections = yield db.collections();
    const collectionNames = collections.map(collection => collection.collectionName);
    expect(collectionNames.includes(MongoDbOperationStore_1.default.collectionName)).toBeTruthy();
    yield db.dropDatabase();
  }));
  describe('insertOrReplace()', () => {
    it('should be able to insert an create operation successfully.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const operationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 0, transactionNumber: 0, operationIndex: 0 });
      const anchoredOperationModel = operationData.anchoredOperationModel;
      yield operationStore.insertOrReplace([anchoredOperationModel]);
      const returnedOperations = yield operationStore.get(anchoredOperationModel.didUniqueSuffix);
      checkEqualArray([anchoredOperationModel], returnedOperations);
    }));
    it('should be able to insert an update operation successfully.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 0, transactionNumber: 0, operationIndex: 0 });
      const anchoredOperationModel = createOperationData.anchoredOperationModel;
      const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
      const operationRequest = yield OperationGenerator_1.default.generateUpdateOperationRequestForServices(didUniqueSuffix, createOperationData.signingPublicKey.publicKeyJwk, createOperationData.signingPrivateKey, OperationGenerator_1.default.generateRandomHash(), 'someID', []);
      const operationModel = yield UpdateOperation_1.default.parse(Buffer.from(JSON.stringify(operationRequest)));
      const anchoredUpdateOperation = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(operationModel, 1, 1, 0);
      yield operationStore.insertOrReplace([anchoredUpdateOperation]);
      const returnedOperations = yield operationStore.get(didUniqueSuffix);
      checkEqualArray([anchoredUpdateOperation], returnedOperations);
    }));
    it('should replace an existing operations successfully.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 0, transactionNumber: 0, operationIndex: 0 });
      const anchoredOperationModel = createOperationData.anchoredOperationModel;
      const clonedCreateRequestWithoutDelta = JsObject_1.default.deepCopyObject(createOperationData.operationRequest);
      delete clonedCreateRequestWithoutDelta.delta;
      const anchoredOperationModelWithoutDelta = JsObject_1.default.deepCopyObject(anchoredOperationModel);
      anchoredOperationModelWithoutDelta.operationBuffer = Buffer.from(JSON.stringify(clonedCreateRequestWithoutDelta));
      yield operationStore.insertOrReplace([anchoredOperationModelWithoutDelta]);
      const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
      const returnedOperations1 = yield operationStore.get(didUniqueSuffix);
      checkEqualArray([anchoredOperationModelWithoutDelta], returnedOperations1);
      yield operationStore.insertOrReplace([anchoredOperationModel]);
      const returnedOperations2 = yield operationStore.get(didUniqueSuffix);
      checkEqualArray([anchoredOperationModel], returnedOperations2);
    }));
  });
  it('should get all operations in a batch put', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 0, transactionNumber: 0, operationIndex: 0 });
    const anchoredOperationModel = createOperationData.anchoredOperationModel;
    const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
    const signingPublicKey = createOperationData.signingPublicKey;
    const signingPrivateKey = createOperationData.signingPrivateKey;
    const chainSize = 10;
    const operationChain = yield createOperationChain(anchoredOperationModel, chainSize, signingPublicKey, signingPrivateKey);
    yield operationStore.insertOrReplace(operationChain);
    const returnedOperations = yield operationStore.get(didUniqueSuffix);
    checkEqualArray(operationChain, returnedOperations);
  }));
  it('should get all operations in a batch put with duplicates', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 0, transactionNumber: 0, operationIndex: 0 });
    const anchoredOperationModel = createOperationData.anchoredOperationModel;
    const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
    const signingPublicKey = createOperationData.signingPublicKey;
    const signingPrivateKey = createOperationData.signingPrivateKey;
    const chainSize = 10;
    const operationChain = yield createOperationChain(anchoredOperationModel, chainSize, signingPublicKey, signingPrivateKey);
    const batchWithDuplicates = operationChain.concat(operationChain);
    yield operationStore.insertOrReplace(batchWithDuplicates);
    const returnedOperations = yield operationStore.get(didUniqueSuffix);
    checkEqualArray(operationChain, returnedOperations);
  }));
  it('should delete all', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 0, transactionNumber: 0, operationIndex: 0 });
    const anchoredOperationModel = createOperationData.anchoredOperationModel;
    const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
    const signingPublicKey = createOperationData.signingPublicKey;
    const signingPrivateKey = createOperationData.signingPrivateKey;
    const chainSize = 10;
    const operationChain = yield createOperationChain(anchoredOperationModel, chainSize, signingPublicKey, signingPrivateKey);
    yield operationStore.insertOrReplace(operationChain);
    const returnedOperations = yield operationStore.get(didUniqueSuffix);
    checkEqualArray(operationChain, returnedOperations);
    yield operationStore.delete();
    const returnedOperationsAfterRollback = yield operationStore.get(didUniqueSuffix);
    expect(returnedOperationsAfterRollback.length).toEqual(0);
  }));
  it('should delete operations with timestamp filter', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 0, transactionNumber: 0, operationIndex: 0 });
    const anchoredOperationModel = createOperationData.anchoredOperationModel;
    const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
    const signingPublicKey = createOperationData.signingPublicKey;
    const signingPrivateKey = createOperationData.signingPrivateKey;
    const chainSize = 10;
    const operationChain = yield createOperationChain(anchoredOperationModel, chainSize, signingPublicKey, signingPrivateKey);
    yield operationStore.insertOrReplace(operationChain);
    const returnedOperations = yield operationStore.get(didUniqueSuffix);
    checkEqualArray(operationChain, returnedOperations);
    const rollbackTime = chainSize / 2;
    yield operationStore.delete(rollbackTime);
    const returnedOperationsAfterRollback = yield operationStore.get(didUniqueSuffix);
    checkEqualArray(operationChain.slice(0, rollbackTime + 1), returnedOperationsAfterRollback);
  }));
  it('should remember operations after stop/restart', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 0, transactionNumber: 0, operationIndex: 0 });
    const anchoredOperationModel = createOperationData.anchoredOperationModel;
    const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
    const signingPublicKey = createOperationData.signingPublicKey;
    const signingPrivateKey = createOperationData.signingPrivateKey;
    const chainSize = 10;
    const operationChain = yield createOperationChain(anchoredOperationModel, chainSize, signingPublicKey, signingPrivateKey);
    yield operationStore.insertOrReplace(operationChain);
    let returnedOperations = yield operationStore.get(didUniqueSuffix);
    checkEqualArray(operationChain, returnedOperations);
    operationStore = yield createOperationStore(config.mongoDbConnectionString);
    returnedOperations = yield operationStore.get(didUniqueSuffix);
    checkEqualArray(operationChain, returnedOperations);
  }));
  it('should get all operations in transaction time order', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 0, transactionNumber: 0, operationIndex: 0 });
    const anchoredOperationModel = createOperationData.anchoredOperationModel;
    const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
    const signingPublicKey = createOperationData.signingPublicKey;
    const signingPrivateKey = createOperationData.signingPrivateKey;
    const chainSize = 10;
    const operationChain = yield createOperationChain(anchoredOperationModel, chainSize, signingPublicKey, signingPrivateKey);
    for (let i = chainSize - 1; i >= 0; i--) {
      yield operationStore.insertOrReplace([operationChain[i]]);
    }
    const returnedOperations = yield operationStore.get(didUniqueSuffix);
    checkEqualArray(operationChain, returnedOperations);
  }));
  describe('deleteUpdatesEarlierThan()', () => {
    it('should delete updates in the earlier transactions correctly', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 0, transactionNumber: 0, operationIndex: 0 });
      const anchoredOperationModel = createOperationData.anchoredOperationModel;
      const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
      const signingPublicKey = createOperationData.signingPublicKey;
      const signingPrivateKey = createOperationData.signingPrivateKey;
      const chainSize = 10;
      const operationChain = yield createOperationChain(anchoredOperationModel, chainSize, signingPublicKey, signingPrivateKey);
      yield operationStore.insertOrReplace(operationChain);
      const returnedOperations = yield operationStore.get(didUniqueSuffix);
      checkEqualArray(operationChain, returnedOperations);
      const markerOperation = operationChain[5];
      yield operationStore.deleteUpdatesEarlierThan(didUniqueSuffix, markerOperation.transactionNumber, markerOperation.operationIndex);
      const returnedOperationsAfterDeletion = yield operationStore.get(didUniqueSuffix);
      const expectedRemainingOperations = [anchoredOperationModel];
      expectedRemainingOperations.push(...operationChain.slice(5));
      checkEqualArray(expectedRemainingOperations, returnedOperationsAfterDeletion);
    }));
    it('should delete earlier updates in the same transaction correctly', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 0, transactionNumber: 0, operationIndex: 0 });
      const anchoredOperationModel = createOperationData.anchoredOperationModel;
      const didUniqueSuffix = anchoredOperationModel.didUniqueSuffix;
      const signingPublicKey = createOperationData.signingPublicKey;
      const signingPrivateKey = createOperationData.signingPrivateKey;
      const chainSize = 10;
      const txnNumber = 1;
      const operationChain = yield createOperationChain(anchoredOperationModel, chainSize, signingPublicKey, signingPrivateKey, txnNumber);
      yield operationStore.insertOrReplace(operationChain);
      const returnedOperations = yield operationStore.get(didUniqueSuffix);
      checkEqualArray(operationChain, returnedOperations);
      const markerOperation = operationChain[5];
      yield operationStore.deleteUpdatesEarlierThan(didUniqueSuffix, markerOperation.transactionNumber, markerOperation.operationIndex);
      const returnedOperationsAfterDeletion = yield operationStore.get(didUniqueSuffix);
      const expectedRemainingOperations = [anchoredOperationModel];
      expectedRemainingOperations.push(...operationChain.slice(5));
      checkEqualArray(expectedRemainingOperations, returnedOperationsAfterDeletion);
    }));
  });
}));
// # sourceMappingURL=MongoDbOperationStore.spec.js.map
