'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const mongodb_1 = require('mongodb');
const MongoDbStore_1 = require('../../common/MongoDbStore');
class MongoDbLockTransactionStore extends MongoDbStore_1.default {
  constructor (serverUrl, databaseName) {
    super(serverUrl, MongoDbLockTransactionStore.lockCollectionName, databaseName);
  }

  addLock (bitcoinLock) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const lockInMongoDb = {
        desiredLockAmountInSatoshis: bitcoinLock.desiredLockAmountInSatoshis,
        transactionId: bitcoinLock.transactionId,
        rawTransaction: bitcoinLock.rawTransaction,
        redeemScriptAsHex: bitcoinLock.redeemScriptAsHex,
        createTimestamp: mongodb_1.Long.fromNumber(bitcoinLock.createTimestamp),
        type: bitcoinLock.type
      };
      yield this.collection.insertOne(lockInMongoDb);
    });
  }

  getLastLock () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const lastLocks = yield this.collection
        .find()
        .limit(1)
        .sort({ createTimestamp: -1 })
        .toArray();
      if (!lastLocks || lastLocks.length <= 0) {
        return undefined;
      }
      return lastLocks[0];
    });
  }

  createIndex () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      yield this.collection.createIndex({ createTimestamp: -1 });
    });
  }
}
exports.default = MongoDbLockTransactionStore;
MongoDbLockTransactionStore.lockCollectionName = 'locks';
// # sourceMappingURL=MongoDbLockTransactionStore.js.map
