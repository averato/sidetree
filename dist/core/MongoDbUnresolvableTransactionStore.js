'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const Logger_1 = require('../common/Logger');
const mongodb_1 = require('mongodb');
const MongoDbStore_1 = require('../common/MongoDbStore');
class MongoDbUnresolvableTransactionStore extends MongoDbStore_1.default {
  constructor (serverUrl, databaseName, retryExponentialDelayFactor) {
    super(serverUrl, MongoDbUnresolvableTransactionStore.unresolvableTransactionCollectionName, databaseName);
    this.exponentialDelayFactorInMilliseconds = 60000;
    this.maximumUnresolvableTransactionReturnCount = 100;
    if (retryExponentialDelayFactor !== undefined) {
      this.exponentialDelayFactorInMilliseconds = retryExponentialDelayFactor;
    }
  }

  recordUnresolvableTransactionFetchAttempt (transaction) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const transactionTime = transaction.transactionTime;
      const transactionNumber = transaction.transactionNumber;
      const searchFilter = { transactionTime, transactionNumber: mongodb_1.Long.fromNumber(transactionNumber) };
      const findResults = yield this.collection.find(searchFilter).toArray();
      let unresolvableTransaction;
      if (findResults && findResults.length > 0) {
        unresolvableTransaction = findResults[0];
      }
      if (unresolvableTransaction === undefined) {
        const newUnresolvableTransaction = {
          anchorString: transaction.anchorString,
          transactionTime,
          transactionNumber: mongodb_1.Long.fromNumber(transactionNumber),
          transactionTimeHash: transaction.transactionTimeHash,
          transactionFeePaid: transaction.transactionFeePaid,
          normalizedTransactionFee: transaction.normalizedTransactionFee,
          writer: transaction.writer,
          firstFetchTime: Date.now(),
          retryAttempts: 0,
          nextRetryTime: Date.now()
        };
        yield this.collection.insertOne(newUnresolvableTransaction);
      } else {
        const retryAttempts = unresolvableTransaction.retryAttempts + 1;
        const anchorString = transaction.anchorString;
        const requiredElapsedTimeSinceFirstFetchBeforeNextRetry = Math.pow(2, unresolvableTransaction.retryAttempts) * this.exponentialDelayFactorInMilliseconds;
        const requiredElapsedTimeInSeconds = requiredElapsedTimeSinceFirstFetchBeforeNextRetry / 1000;
        Logger_1.default.info(`Record transaction ${transactionNumber} with anchor string ${anchorString} to retry after ${requiredElapsedTimeInSeconds} seconds.`);
        const nextRetryTime = unresolvableTransaction.firstFetchTime + requiredElapsedTimeSinceFirstFetchBeforeNextRetry;
        const searchFilter = { transactionTime, transactionNumber: mongodb_1.Long.fromNumber(transactionNumber) };
        yield this.collection.updateOne(searchFilter, { $set: { retryAttempts, nextRetryTime } });
      }
    });
  }

  removeUnresolvableTransaction (transaction) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const transactionTime = transaction.transactionTime;
      const transactionNumber = transaction.transactionNumber;
      yield this.collection.deleteOne({ transactionTime, transactionNumber: mongodb_1.Long.fromNumber(transactionNumber) });
    });
  }

  getUnresolvableTransactionsDueForRetry (maximumReturnCount) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      let returnCount = this.maximumUnresolvableTransactionReturnCount;
      if (maximumReturnCount !== undefined) {
        returnCount = maximumReturnCount;
      }
      const now = Date.now();
      const unresolvableTransactionsToRetry = yield this.collection.find({ nextRetryTime: { $lte: now } }).sort({ nextRetryTime: 1 }).limit(returnCount).toArray();
      return unresolvableTransactionsToRetry;
    });
  }

  removeUnresolvableTransactionsLaterThan (transactionNumber) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (transactionNumber === undefined) {
        yield this.clearCollection();
        return;
      }
      yield this.collection.deleteMany({ transactionNumber: { $gt: mongodb_1.Long.fromNumber(transactionNumber) } });
    });
  }

  getUnresolvableTransactions () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const transactions = yield this.collection.find().sort({ transactionTime: 1, transactionNumber: 1 }).toArray();
      return transactions;
    });
  }

  createIndex () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      yield this.collection.createIndex({ transactionTime: 1, transactionNumber: 1 }, { unique: true });
      yield this.collection.createIndex({ nextRetryTime: 1 });
    });
  }
}
exports.default = MongoDbUnresolvableTransactionStore;
MongoDbUnresolvableTransactionStore.unresolvableTransactionCollectionName = 'unresolvable-transactions';
// # sourceMappingURL=MongoDbUnresolvableTransactionStore.js.map
