'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const timeSpan = require('time-span');
const TransactionUnderProcessingModel_1 = require('./models/TransactionUnderProcessingModel');
const EventCode_1 = require('./EventCode');
const EventEmitter_1 = require('../common/EventEmitter');
const Logger_1 = require('../common/Logger');
const SharedErrorCode_1 = require('../common/SharedErrorCode');
const SidetreeError_1 = require('../common/SidetreeError');
const ThroughputLimiter_1 = require('./ThroughputLimiter');
class Observer {
  constructor (versionManager, blockchain, maxConcurrentDownloads, operationStore, transactionStore, unresolvableTransactionStore, confirmationStore, observingIntervalInSeconds) {
    this.versionManager = versionManager;
    this.blockchain = blockchain;
    this.maxConcurrentDownloads = maxConcurrentDownloads;
    this.operationStore = operationStore;
    this.transactionStore = transactionStore;
    this.unresolvableTransactionStore = unresolvableTransactionStore;
    this.confirmationStore = confirmationStore;
    this.observingIntervalInSeconds = observingIntervalInSeconds;
    this.continuePeriodicProcessing = false;
    this.transactionsUnderProcessing = [];
    this.throughputLimiter = new ThroughputLimiter_1.default(versionManager);
  }

  startPeriodicProcessing () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      Logger_1.default.info(`Starting periodic transactions processing.`);
      setImmediate(() => tslib_1.__awaiter(this, void 0, void 0, function * () {
        this.continuePeriodicProcessing = true;
        this.processTransactions();
      }));
    });
  }

  stopPeriodicProcessing () {
    Logger_1.default.info(`Stopped periodic transactions processing.`);
    this.continuePeriodicProcessing = false;
  }

  processTransactions () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      try {
        yield this.storeThenTrimConsecutiveTransactionsProcessed();
        let moreTransactions = false;
        do {
          if (this.cursorTransaction === undefined) {
            this.cursorTransaction = yield this.transactionStore.getLastTransaction();
          }
          const cursorTransactionNumber = this.cursorTransaction ? this.cursorTransaction.transactionNumber : undefined;
          const cursorTransactionTimeHash = this.cursorTransaction ? this.cursorTransaction.transactionTimeHash : undefined;
          const cursorTransactionTime = this.cursorTransaction ? this.cursorTransaction.transactionTime : 0;
          let invalidTransactionNumberOrTimeHash = false;
          let readResult;
          const endTimer = timeSpan();
          try {
            Logger_1.default.info('Fetching Sidetree transactions from blockchain service...');
            readResult = yield this.blockchain.read(cursorTransactionNumber, cursorTransactionTimeHash);
            Logger_1.default.info(`Fetched ${readResult.transactions.length} Sidetree transactions from blockchain service in ${endTimer.rounded()} ms.`);
          } catch (error) {
            if (error instanceof SidetreeError_1.default && error.code === SharedErrorCode_1.default.InvalidTransactionNumberOrTimeHash) {
              Logger_1.default.info(`Invalid transaction number ${cursorTransactionNumber} or time hash ${cursorTransactionTimeHash} given to blockchain service.`);
              invalidTransactionNumberOrTimeHash = true;
            } else {
              throw error;
            }
          }
          const transactions = readResult ? readResult.transactions : [];
          moreTransactions = readResult ? readResult.moreTransactions : false;
          if (transactions.length > 0) {
            this.cursorTransaction = transactions[transactions.length - 1];
          }
          let qualifiedTransactions = yield this.throughputLimiter.getQualifiedTransactions(transactions);
          qualifiedTransactions = qualifiedTransactions.sort((a, b) => { return a.transactionNumber - b.transactionNumber; });
          for (const transaction of qualifiedTransactions) {
            const transactionUnderProcessing = {
              transaction: transaction,
              processingStatus: TransactionUnderProcessingModel_1.TransactionProcessingStatus.Processing
            };
            this.transactionsUnderProcessing.push(transactionUnderProcessing);
            this.processTransaction(transaction, transactionUnderProcessing);
          }
          let blockReorganizationDetected = false;
          if (invalidTransactionNumberOrTimeHash) {
            const latestBlockchainTime = yield this.blockchain.getLatestTime();
            if (cursorTransactionTime <= latestBlockchainTime.time) {
              blockReorganizationDetected = true;
              moreTransactions = true;
            } else {
              Logger_1.default.info(`Blockchain microservice blockchain time is behind last known transaction time, waiting for blockchain microservice to catch up...`);
            }
          }
          if (blockReorganizationDetected) {
            Logger_1.default.info(`Block reorganization detected.`);
            EventEmitter_1.default.emit(EventCode_1.default.SidetreeObserverBlockReorganization);
            yield Observer.waitUntilCountOfTransactionsUnderProcessingIsLessOrEqualTo(this.transactionsUnderProcessing, 0);
            yield this.storeThenTrimConsecutiveTransactionsProcessed();
            Logger_1.default.info(`Reverting invalid transactions...`);
            yield this.revertInvalidTransactions();
            Logger_1.default.info(`Completed reverting invalid transactions.`);
            this.cursorTransaction = undefined;
          } else {
            yield Observer.waitUntilCountOfTransactionsUnderProcessingIsLessOrEqualTo(this.transactionsUnderProcessing, this.maxConcurrentDownloads);
            yield this.storeThenTrimConsecutiveTransactionsProcessed();
            const hasErrorInTransactionProcessing = this.hasErrorInTransactionProcessing();
            if (hasErrorInTransactionProcessing) {
              yield Observer.waitUntilCountOfTransactionsUnderProcessingIsLessOrEqualTo(this.transactionsUnderProcessing, 0);
              yield this.storeThenTrimConsecutiveTransactionsProcessed();
              this.transactionsUnderProcessing = [];
              this.cursorTransaction = undefined;
            }
          }
        } while (moreTransactions);
        Logger_1.default.info('Successfully kicked off downloading/processing of all new Sidetree transactions.');
        yield this.processUnresolvableTransactions();
        EventEmitter_1.default.emit(EventCode_1.default.SidetreeObserverLoopSuccess);
      } catch (error) {
        EventEmitter_1.default.emit(EventCode_1.default.SidetreeObserverLoopFailure);
        Logger_1.default.error(`Encountered unhandled and possibly fatal Observer error, must investigate and fix:`);
        Logger_1.default.error(error);
      } finally {
        if (this.continuePeriodicProcessing) {
          Logger_1.default.info(`Waiting for ${this.observingIntervalInSeconds} seconds before fetching and processing transactions again.`);
          setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function * () { return this.processTransactions(); }), this.observingIntervalInSeconds * 1000);
        }
      }
    });
  }

  static getCountOfTransactionsUnderProcessing (transactionsUnderProcessing) {
    const countOfTransactionsUnderProcessing = transactionsUnderProcessing.filter(transaction => transaction.processingStatus === TransactionUnderProcessingModel_1.TransactionProcessingStatus.Processing).length;
    return countOfTransactionsUnderProcessing;
  }

  hasErrorInTransactionProcessing () {
    const firstTransactionProcessingError = this.transactionsUnderProcessing.find(transaction => transaction.processingStatus === TransactionUnderProcessingModel_1.TransactionProcessingStatus.Error);
    return (firstTransactionProcessingError !== undefined);
  }

  static waitUntilCountOfTransactionsUnderProcessingIsLessOrEqualTo (transactionsUnderProcessing, count) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      let countOfTransactionsUnderProcessing = Observer.getCountOfTransactionsUnderProcessing(transactionsUnderProcessing);
      while (countOfTransactionsUnderProcessing > count) {
        yield new Promise(resolve => setTimeout(resolve, 1000));
        countOfTransactionsUnderProcessing = Observer.getCountOfTransactionsUnderProcessing(transactionsUnderProcessing);
      }
    });
  }

  processUnresolvableTransactions () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      Logger_1.default.info(`Processing previously unresolvable transactions if any...`);
      const endTimer = timeSpan();
      const unresolvableTransactions = yield this.unresolvableTransactionStore.getUnresolvableTransactionsDueForRetry();
      Logger_1.default.info(`Fetched ${unresolvableTransactions.length} unresolvable transactions to retry in ${endTimer.rounded()} ms.`);
      const unresolvableTransactionStatus = [];
      for (const transaction of unresolvableTransactions) {
        const awaitingTransaction = {
          transaction: transaction,
          processingStatus: TransactionUnderProcessingModel_1.TransactionProcessingStatus.Processing
        };
        unresolvableTransactionStatus.push(awaitingTransaction);
        this.processTransaction(transaction, awaitingTransaction);
      }
      yield Observer.waitUntilCountOfTransactionsUnderProcessingIsLessOrEqualTo(unresolvableTransactionStatus, 0);
    });
  }

  storeThenTrimConsecutiveTransactionsProcessed () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      let lastConsecutivelyProcessedTransaction;
      let i = 0;
      while (i < this.transactionsUnderProcessing.length &&
                this.transactionsUnderProcessing[i].processingStatus === TransactionUnderProcessingModel_1.TransactionProcessingStatus.Processed) {
        lastConsecutivelyProcessedTransaction = this.transactionsUnderProcessing[i].transaction;
        yield this.transactionStore.addTransaction(lastConsecutivelyProcessedTransaction);
        i++;
      }
      this.transactionsUnderProcessing.splice(0, i);
    });
  }

  processTransaction (transaction, transactionUnderProcessing) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      let transactionProcessedSuccessfully;
      try {
        const transactionProcessor = this.versionManager.getTransactionProcessor(transaction.transactionTime);
        transactionProcessedSuccessfully = yield transactionProcessor.processTransaction(transaction);
      } catch (error) {
        Logger_1.default.error(`Unhandled error encountered processing transaction '${transaction.transactionNumber}'.`);
        Logger_1.default.error(error);
        transactionProcessedSuccessfully = false;
      }
      Logger_1.default.info(`Transaction ${transaction.anchorString} is confirmed at ${transaction.transactionTime}`);
      yield this.confirmationStore.confirm(transaction.anchorString, transaction.transactionTime);
      if (transactionProcessedSuccessfully) {
        Logger_1.default.info(`Removing transaction '${transaction.transactionNumber}' from unresolvable transactions if exists...`);
        this.unresolvableTransactionStore.removeUnresolvableTransaction(transaction);
      } else {
        try {
          Logger_1.default.info(`Recording failed processing attempt for transaction '${transaction.transactionNumber}'...`);
          yield this.unresolvableTransactionStore.recordUnresolvableTransactionFetchAttempt(transaction);
        } catch (error) {
          transactionUnderProcessing.processingStatus = TransactionUnderProcessingModel_1.TransactionProcessingStatus.Error;
          Logger_1.default.error(`Error encountered saving unresolvable transaction '${transaction.transactionNumber}' for retry.`);
          Logger_1.default.error(error);
          return;
        }
      }
      Logger_1.default.info(`Finished processing transaction '${transaction.transactionNumber}'.`);
      transactionUnderProcessing.processingStatus = TransactionUnderProcessingModel_1.TransactionProcessingStatus.Processed;
    });
  }

  revertInvalidTransactions () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const exponentiallySpacedTransactions = yield this.transactionStore.getExponentiallySpacedTransactions();
      const bestKnownValidRecentTransaction = yield this.blockchain.getFirstValidTransaction(exponentiallySpacedTransactions);
      const bestKnownValidRecentTransactionNumber = bestKnownValidRecentTransaction === undefined ? undefined : bestKnownValidRecentTransaction.transactionNumber;
      Logger_1.default.info(`Best known valid recent transaction: ${bestKnownValidRecentTransactionNumber}`);
      Logger_1.default.info('Reverting operations...');
      yield this.operationStore.delete(bestKnownValidRecentTransactionNumber);
      yield this.unresolvableTransactionStore.removeUnresolvableTransactionsLaterThan(bestKnownValidRecentTransactionNumber);
      yield this.confirmationStore.resetAfter(bestKnownValidRecentTransaction === null || bestKnownValidRecentTransaction === void 0 ? void 0 : bestKnownValidRecentTransaction.transactionTime);
      yield this.transactionStore.removeTransactionsLaterThan(bestKnownValidRecentTransactionNumber);
    });
  }
}
exports.default = Observer;
// # sourceMappingURL=Observer.js.map
