'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const MongoDbStore_1 = require('./MongoDbStore');
class MongoDbServiceStateStore extends MongoDbStore_1.default {
  constructor (serverUrl, databaseName) {
    super(serverUrl, MongoDbServiceStateStore.collectionName, databaseName);
  }

  put (serviceState) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      yield this.collection.replaceOne({}, serviceState, { upsert: true });
    });
  }

  get () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const serviceState = yield this.collection.findOne({});
      return serviceState ? serviceState : {};
    });
  }
}
exports.default = MongoDbServiceStateStore;
MongoDbServiceStateStore.collectionName = 'service';
// # sourceMappingURL=MongoDbServiceStateStore.js.map
