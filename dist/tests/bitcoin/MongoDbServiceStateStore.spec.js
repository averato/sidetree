'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const mongodb_1 = require('mongodb');
const MongoDb_1 = require('../common/MongoDb');
const MongoDbServiceStateStore_1 = require('../../lib/common/MongoDbServiceStateStore');
function createStore (storeUri, databaseName) {
  return tslib_1.__awaiter(this, void 0, void 0, function * () {
    const store = new MongoDbServiceStateStore_1.default(storeUri, databaseName);
    yield store.initialize();
    return store;
  });
}
describe('MongoDbServiceStateStore', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  const config = require('../json/config-test.json');
  const databaseName = 'sidetree-test';
  let store;
  beforeAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    yield MongoDb_1.default.createInmemoryDb(config);
    store = yield createStore(config.mongoDbConnectionString, databaseName);
  }));
  beforeEach(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    yield store.clearCollection();
  }));
  it('should put and get service state correctly.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const initialServiceState = { databaseVersion: '1.0.0' };
    yield store.put(initialServiceState);
    let actualServiceState = yield store.get();
    expect(actualServiceState).toEqual(initialServiceState);
    const newServiceState = { databaseVersion: '2.0.0' };
    yield store.put(newServiceState);
    actualServiceState = yield store.get();
    expect(actualServiceState).toEqual(newServiceState);
    done();
  }));
  describe('get()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should get empty object if service state is not found in DB.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      yield store.clearCollection();
      const actualServiceState = yield store.get();
      expect(actualServiceState).toEqual({});
    }));
  }));
  describe('initialize()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should create collection on initialization if it does not exist.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const client = yield mongodb_1.MongoClient.connect(config.mongoDbConnectionString);
      const db = client.db(databaseName);
      yield db.dropCollection(MongoDbServiceStateStore_1.default.collectionName);
      const collections = yield db.collections();
      const collectionNames = collections.map(collection => collection.collectionName);
      expect(collectionNames.includes(MongoDbServiceStateStore_1.default.collectionName)).toBeFalsy();
      yield store.initialize();
      yield store.put({ databaseVersion: '1.1.0' });
      const serviceState = yield store.get();
      expect(serviceState === null || serviceState === void 0 ? void 0 : serviceState.databaseVersion).toEqual('1.1.0');
      done();
    }));
  }));
}));
// # sourceMappingURL=MongoDbServiceStateStore.spec.js.map
