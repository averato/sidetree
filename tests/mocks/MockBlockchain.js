'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
class MockBlockchain {
  constructor () {
    this.hashes = [];
    this.latestTime = { time: 500000, hash: 'dummyHash' };
  }

  write (anchorString, fee) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      this.hashes.push([anchorString, fee]);
    });
  }

  read (sinceTransactionNumber, _transactionTimeHash) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (sinceTransactionNumber === undefined) {
        sinceTransactionNumber = -1;
      }
      let moreTransactions = false;
      if (this.hashes.length > 0 &&
                sinceTransactionNumber < this.hashes.length - 2) {
        moreTransactions = true;
      }
      const transactions = [];
      if (this.hashes.length > 0 &&
                sinceTransactionNumber < this.hashes.length - 1) {
        const hashIndex = sinceTransactionNumber + 1;
        const transaction = {
          transactionNumber: hashIndex,
          transactionTime: hashIndex,
          transactionTimeHash: this.hashes[hashIndex][0],
          anchorString: this.hashes[hashIndex][0],
          transactionFeePaid: this.hashes[hashIndex][1],
          normalizedTransactionFee: this.hashes[hashIndex][1],
          writer: 'writer'
        };
        transactions.push(transaction);
      }
      return {
        moreTransactions: moreTransactions,
        transactions: transactions
      };
    });
  }

  getFirstValidTransaction (_transactions) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      return undefined;
    });
  }

  getServiceVersion () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      throw Error('getServiceVersion() not implemented.');
    });
  }

  getLatestTime () {
    return new Promise((resolve) => { resolve(this.latestTime); });
  }

  setLatestTime (time) {
    this.latestTime = time;
  }

  getFee (transactionTime) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      throw Error('getFee() not implemented. Inputs: ' + transactionTime);
    });
  }

  getValueTimeLock (_lockIdentifer) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      throw Error('getValueTimeLock() Not implemented.');
    });
  }

  getWriterValueTimeLock () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      throw Error('getWriterValueTimeLock() not implemented.');
    });
  }
}
exports.default = MockBlockchain;
// # sourceMappingURL=MockBlockchain.js.map
