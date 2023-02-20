'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const mongodb_1 = require('mongodb');
const MongoDbStore_1 = require('../common/MongoDbStore');
const OperationType_1 = require('./enums/OperationType');
class MongoDbOperationStore extends MongoDbStore_1.default {
  constructor (serverUrl, databaseName) {
    super(serverUrl, MongoDbOperationStore.collectionName, databaseName);
  }

  createIndex () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      yield this.collection.createIndex({ didSuffix: 1, txnNumber: 1, opIndex: 1, type: 1 }, { unique: true });
      yield this.collection.createIndex({ didSuffix: 1, txnNumber: 1, opIndex: 1 }, { unique: true });
      yield this.collection.createIndex({ didSuffix: 1 }, { unique: false });
    });
  }

  insertOrReplace (operations) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const bulkOperations = this.collection.initializeUnorderedBulkOp();
      for (const operation of operations) {
        const mongoOperation = MongoDbOperationStore.convertToMongoOperation(operation);
        bulkOperations.find({
          didSuffix: operation.didUniqueSuffix,
          txnNumber: operation.transactionNumber,
          opIndex: operation.operationIndex,
          type: operation.type
        }).upsert().replaceOne(mongoOperation);
      }
      yield bulkOperations.execute();
    });
  }

  get (didUniqueSuffix) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const mongoOperations = yield this.collection
        .find({ didSuffix: didUniqueSuffix })
        .sort({ didSuffix: 1, txnNumber: 1, opIndex: 1 })
        .maxTimeMS(MongoDbStore_1.default.defaultQueryTimeoutInMilliseconds)
        .toArray();
      return mongoOperations.map((operation) => { return MongoDbOperationStore.convertToAnchoredOperationModel(operation); });
    });
  }

  delete (transactionNumber) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (transactionNumber) {
        yield this.collection.deleteMany({ txnNumber: { $gt: mongodb_1.Long.fromNumber(transactionNumber) } });
      } else {
        yield this.collection.deleteMany({});
      }
    });
  }

  deleteUpdatesEarlierThan (didUniqueSuffix, transactionNumber, operationIndex) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      yield this.collection.deleteMany({
        $or: [
          {
            didSuffix: didUniqueSuffix,
            txnNumber: { $lt: mongodb_1.Long.fromNumber(transactionNumber) },
            type: OperationType_1.default.Update
          },
          {
            didSuffix: didUniqueSuffix,
            txnNumber: mongodb_1.Long.fromNumber(transactionNumber),
            opIndex: { $lt: operationIndex },
            type: OperationType_1.default.Update
          }
        ]
      });
    });
  }

  static convertToMongoOperation (operation) {
    return {
      type: operation.type,
      didSuffix: operation.didUniqueSuffix,
      operationBufferBsonBinary: new mongodb_1.Binary(operation.operationBuffer),
      opIndex: operation.operationIndex,
      txnNumber: mongodb_1.Long.fromNumber(operation.transactionNumber),
      txnTime: operation.transactionTime
    };
  }

  static convertToAnchoredOperationModel (mongoOperation) {
    return {
      type: mongoOperation.type,
      didUniqueSuffix: mongoOperation.didSuffix,
      operationBuffer: mongoOperation.operationBufferBsonBinary.buffer,
      operationIndex: mongoOperation.opIndex,
      transactionNumber: mongoOperation.txnNumber,
      transactionTime: mongoOperation.txnTime
    };
  }
}
exports.default = MongoDbOperationStore;
MongoDbOperationStore.collectionName = 'operations';
// # sourceMappingURL=MongoDbOperationStore.js.map
