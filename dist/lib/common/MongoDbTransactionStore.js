'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const mongodb_1 = require('mongodb');
const Logger_1 = require('../common/Logger');
const MongoDbStore_1 = require('./MongoDbStore');
class MongoDbTransactionStore extends MongoDbStore_1.default {
  constructor (serverUrl, databaseName) {
    super(serverUrl, MongoDbTransactionStore.transactionCollectionName, databaseName);
  }

  getTransactionsCount () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const transactionCount = yield this.collection.count();
      return transactionCount;
    });
  }

  getTransaction (transactionNumber) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const transactions = yield this.collection.find({ transactionNumber: mongodb_1.Long.fromNumber(transactionNumber) }).toArray();
      if (transactions.length === 0) {
        return undefined;
      }
      const transaction = transactions[0];
      return transaction;
    });
  }

  getTransactionsLaterThan (transactionNumber, max) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      let transactions = [];
      try {
        let dbCursor;
        if (transactionNumber === undefined) {
          dbCursor = this.collection.find();
        } else {
          dbCursor = this.collection.find({ transactionNumber: { $gt: mongodb_1.Long.fromNumber(transactionNumber) } });
        }
        if (max) {
          dbCursor = dbCursor.limit(max);
        }
        dbCursor = dbCursor.sort({ transactionNumber: 1 });
        transactions = yield dbCursor.toArray();
      } catch (error) {
        Logger_1.default.error(error);
      }
      return transactions;
    });
  }

  addTransaction (transaction) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      try {
        const transactionInMongoDb = {
          anchorString: transaction.anchorString,
          transactionNumber: mongodb_1.Long.fromNumber(transaction.transactionNumber),
          transactionTime: transaction.transactionTime,
          transactionTimeHash: transaction.transactionTimeHash,
          transactionFeePaid: transaction.transactionFeePaid,
          normalizedTransactionFee: transaction.normalizedTransactionFee,
          writer: transaction.writer
        };
        yield this.collection.insertOne(transactionInMongoDb);
      } catch (error) {
        if (error.code !== 11000) {
          throw error;
        }
      }
    });
  }

  getLastTransaction () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const lastTransactions = yield this.collection.find().limit(1).sort({ transactionNumber: -1 }).toArray();
      if (lastTransactions.length === 0) {
        return undefined;
      }
      const lastProcessedTransaction = lastTransactions[0];
      return lastProcessedTransaction;
    });
  }

  getExponentiallySpacedTransactions () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const exponentiallySpacedTransactions = [];
      const allTransactions = yield this.collection.find().sort({ transactionNumber: 1 }).toArray();
      let index = allTransactions.length - 1;
      let distance = 1;
      while (index >= 0) {
        exponentiallySpacedTransactions.push(allTransactions[index]);
        index -= distance;
        distance *= 2;
      }
      return exponentiallySpacedTransactions;
    });
  }

  removeTransactionsLaterThan (transactionNumber) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (transactionNumber === undefined) {
        yield this.clearCollection();
        return;
      }
      yield this.collection.deleteMany({ transactionNumber: { $gt: mongodb_1.Long.fromNumber(transactionNumber) } });
    });
  }

  removeTransactionByTransactionTimeHash (transactionTimeHash) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      yield this.collection.deleteMany({ transactionTimeHash: { $eq: transactionTimeHash } });
    });
  }

  getTransactions () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const transactions = yield this.collection.find().sort({ transactionNumber: 1 }).toArray();
      return transactions;
    });
  }

  getTransactionsStartingFrom (inclusiveBeginTransactionTime, exclusiveEndTransactionTime) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      let cursor;
      if (inclusiveBeginTransactionTime === exclusiveEndTransactionTime) {
        cursor = this.collection.find({ transactionTime: { $eq: mongodb_1.Long.fromNumber(inclusiveBeginTransactionTime) } });
      } else {
        cursor = this.collection.find({
          $and: [
            { transactionTime: { $gte: mongodb_1.Long.fromNumber(inclusiveBeginTransactionTime) } },
            { transactionTime: { $lt: mongodb_1.Long.fromNumber(exclusiveEndTransactionTime) } }
          ]
        });
      }
      const transactions = yield cursor.sort({ transactionNumber: 1 }).toArray();
      return transactions;
    });
  }

  createIndex () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      yield this.collection.createIndex({ transactionNumber: 1 }, { unique: true });
    });
  }
}
exports.default = MongoDbTransactionStore;
MongoDbTransactionStore.transactionCollectionName = 'transactions';
// # sourceMappingURL=MongoDbTransactionStore.js.map
