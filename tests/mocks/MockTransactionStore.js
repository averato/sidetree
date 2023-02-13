'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const SortedArray_1 = require('../core/util/SortedArray');
class MockTransactionStore {
  constructor () {
    this.processedTransactions = [];
    this.unresolvableTransactions = new Map();
  }

  addTransaction (transaction) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const lastTransaction = yield this.getLastTransaction();
      if (lastTransaction && lastTransaction.transactionNumber >= transaction.transactionNumber) {
        return;
      }
      this.processedTransactions.push(transaction);
    });
  }

  getLastTransaction () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (this.processedTransactions.length === 0) {
        return undefined;
      }
      const lastProcessedTransactionIndex = this.processedTransactions.length - 1;
      const lastProcessedTransaction = this.processedTransactions[lastProcessedTransactionIndex];
      return lastProcessedTransaction;
    });
  }

  getExponentiallySpacedTransactions () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const exponentiallySpacedTransactions = [];
      let index = this.processedTransactions.length - 1;
      let distance = 1;
      while (index >= 0) {
        exponentiallySpacedTransactions.push(this.processedTransactions[index]);
        index -= distance;
        distance *= 2;
      }
      return exponentiallySpacedTransactions;
    });
  }

  getTransaction (_transactionNumber) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      throw new Error('Not implemented.');
    });
  }

  getTransactionsLaterThan (transactionNumber, max) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      let transactions = this.processedTransactions;
      if (transactionNumber !== undefined) {
        transactions = transactions.filter(entry => entry.transactionTime > transactionNumber);
      }
      if (max !== undefined) {
        transactions = transactions.slice(0, max);
      }
      return transactions;
    });
  }

  recordUnresolvableTransactionFetchAttempt (transaction) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const unresolvableTransaction = this.unresolvableTransactions.get(transaction.transactionNumber);
      if (unresolvableTransaction === undefined) {
        const unresolvableTransaction = {
          transaction,
          firstFetchTime: Date.now(),
          retryAttempts: 0,
          nextRetryTime: Date.now()
        };
        this.unresolvableTransactions.set(transaction.transactionNumber, unresolvableTransaction);
      } else {
        unresolvableTransaction.retryAttempts++;
        const exponentialFactorInMilliseconds = 60000;
        const requiredElapsedTimeSinceFirstFetchBeforeNextRetry = Math.pow(2, unresolvableTransaction.retryAttempts) * exponentialFactorInMilliseconds;
        const requiredElapsedTimeInSeconds = requiredElapsedTimeSinceFirstFetchBeforeNextRetry / 1000;
        const anchorString = transaction.anchorString;
        const transactionNumber = transaction.transactionNumber;
        console.info(`Record transaction ${transactionNumber} with anchor string ${anchorString} to retry after ${requiredElapsedTimeInSeconds} seconds.`);
        unresolvableTransaction.nextRetryTime = unresolvableTransaction.firstFetchTime + requiredElapsedTimeSinceFirstFetchBeforeNextRetry;
      }
    });
  }

  removeUnresolvableTransaction (transaction) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      this.unresolvableTransactions.delete(transaction.transactionNumber);
    });
  }

  getUnresolvableTransactionsDueForRetry () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const now = Date.now();
      const unresolvableTransactionsToRetry = [];
      for (const value of this.unresolvableTransactions.values()) {
        if (now > value.nextRetryTime) {
          unresolvableTransactionsToRetry.push(value.transaction);
        }
      }
      return unresolvableTransactionsToRetry;
    });
  }

  removeTransactionsLaterThan (transactionNumber) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (transactionNumber === undefined) {
        this.processedTransactions = [];
        return;
      }
      const compareTransactionAndTransactionNumber = (transaction, transactionNumber) => { return transaction.transactionNumber - transactionNumber; };
      const bestKnownValidRecentProcessedTransactionIndex = SortedArray_1.default.binarySearch(this.processedTransactions, transactionNumber, compareTransactionAndTransactionNumber);
      if (bestKnownValidRecentProcessedTransactionIndex === undefined) {
        throw Error(`Unable to locate processed transaction: ${transactionNumber}`);
      }
      console.info(`Reverting ${this.processedTransactions.length - bestKnownValidRecentProcessedTransactionIndex - 1} transactions...`);
      this.processedTransactions.splice(bestKnownValidRecentProcessedTransactionIndex + 1);
    });
  }

  removeUnresolvableTransactionsLaterThan (transactionNumber) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (transactionNumber === undefined) {
        this.unresolvableTransactions = new Map();
        return;
      }
      const invalidUnresolvableTransactionNumbers = [];
      for (const key of this.unresolvableTransactions.keys()) {
        if (key > transactionNumber) {
          invalidUnresolvableTransactionNumbers.push(key);
        }
      }
      for (const key of invalidUnresolvableTransactionNumbers) {
        this.unresolvableTransactions.delete(key);
      }
    });
  }

  getTransactions () {
    return this.processedTransactions;
  }

  getTransactionsStartingFrom (inclusiveBeginTransactionTime, exclusiveEndTransactionTime) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (inclusiveBeginTransactionTime === exclusiveEndTransactionTime) {
        return this.processedTransactions.filter((transaction) => { return transaction.transactionTime === inclusiveBeginTransactionTime; });
      } else {
        return this.processedTransactions.filter((transaction) => {
          return transaction.transactionTime >= inclusiveBeginTransactionTime &&
                        transaction.transactionTime < exclusiveEndTransactionTime;
        });
      }
    });
  }
}
exports.default = MockTransactionStore;
// # sourceMappingURL=MockTransactionStore.js.map
