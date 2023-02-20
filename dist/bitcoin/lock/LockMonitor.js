'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const ErrorCode_1 = require('../ErrorCode');
const EventCode_1 = require('../EventCode');
const EventEmitter_1 = require('../../common/EventEmitter');
const LockIdentifierSerializer_1 = require('./LockIdentifierSerializer');
const LogColor_1 = require('../../common/LogColor');
const Logger_1 = require('../../common/Logger');
const SavedLockType_1 = require('../enums/SavedLockType');
const SidetreeError_1 = require('../../common/SidetreeError');
var LockStatus;
(function (LockStatus) {
  LockStatus['Confirmed'] = 'confirmed';
  LockStatus['None'] = 'none';
  LockStatus['Pending'] = 'pending';
})(LockStatus || (LockStatus = {}));
class LockMonitor {
  constructor (bitcoinClient, lockTransactionStore, lockResolver, pollPeriodInSeconds, valueTimeLockUpdateEnabled, desiredLockAmountInSatoshis, transactionFeesAmountInSatoshis, versionManager) {
    this.bitcoinClient = bitcoinClient;
    this.lockTransactionStore = lockTransactionStore;
    this.lockResolver = lockResolver;
    this.pollPeriodInSeconds = pollPeriodInSeconds;
    this.valueTimeLockUpdateEnabled = valueTimeLockUpdateEnabled;
    this.desiredLockAmountInSatoshis = desiredLockAmountInSatoshis;
    this.transactionFeesAmountInSatoshis = transactionFeesAmountInSatoshis;
    this.versionManager = versionManager;
    if (!Number.isInteger(desiredLockAmountInSatoshis)) {
      throw new SidetreeError_1.default(ErrorCode_1.default.LockMonitorDesiredLockAmountIsNotWholeNumber, `${desiredLockAmountInSatoshis}`);
    }
    if (!Number.isInteger(transactionFeesAmountInSatoshis)) {
      throw new SidetreeError_1.default(ErrorCode_1.default.LockMonitorTransactionFeesAmountIsNotWholeNumber, `${transactionFeesAmountInSatoshis}`);
    }
  }

  startPeriodicProcessing () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      yield this.periodicPoll();
    });
  }

  getCurrentValueTimeLock () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const currentLockState = yield this.getCurrentLockState();
      if (currentLockState.status === LockStatus.None) {
        return undefined;
      }
      if (currentLockState.status === LockStatus.Pending) {
        throw new SidetreeError_1.default(ErrorCode_1.default.LockMonitorCurrentValueTimeLockInPendingState);
      }
      return currentLockState.activeValueTimeLock;
    });
  }

  periodicPoll () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      try {
        if (this.periodicPollTimeoutId) {
          clearTimeout(this.periodicPollTimeoutId);
        }
        Logger_1.default.info(`Starting periodic polling for the lock monitor.`);
        yield this.handlePeriodicPolling();
        EventEmitter_1.default.emit(EventCode_1.default.BitcoinLockMonitorLoopSuccess);
      } catch (e) {
        EventEmitter_1.default.emit(EventCode_1.default.BitcoinLockMonitorLoopFailure);
        if (e instanceof SidetreeError_1.default) {
          const message = `An error occurred during periodic poll: ${SidetreeError_1.default.stringify(e)}`;
          Logger_1.default.error(message);
        }
      } finally {
        this.periodicPollTimeoutId = setTimeout(this.periodicPoll.bind(this), 1000 * this.pollPeriodInSeconds);
      }
      Logger_1.default.info(`Ending periodic polling for the lock monitor.`);
    });
  }

  handlePeriodicPolling () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const currentLockState = yield this.getCurrentLockState();
      Logger_1.default.info(`Refreshed the in-memory value time lock state.`);
      if (this.valueTimeLockUpdateEnabled === false) {
        Logger_1.default.info(`Value time lock update is disabled, will not attempt to update the value time lock.`);
        return;
      }
      if (currentLockState.status === LockStatus.Pending) {
        Logger_1.default.info(`The current lock status is in pending state, rebroadcast the transaction again in case the transaction is lost in the previous broadcast.`);
        yield this.rebroadcastTransaction(currentLockState.latestSavedLockInfo);
        return;
      }
      const validCurrentLockExist = currentLockState.status === LockStatus.Confirmed;
      const lockRequired = this.desiredLockAmountInSatoshis > 0;
      if (lockRequired && !validCurrentLockExist) {
        yield this.handleCreatingNewLock(this.desiredLockAmountInSatoshis);
      }
      if (lockRequired && validCurrentLockExist) {
        yield this.handleExistingLockRenewal(currentLockState.activeValueTimeLock, currentLockState.latestSavedLockInfo, this.desiredLockAmountInSatoshis);
      }
      if (!lockRequired && validCurrentLockExist) {
        Logger_1.default.info(LogColor_1.default.lightBlue(`Value time lock no longer needed.`));
        yield this.handleReleaseExistingLock(currentLockState.activeValueTimeLock, this.desiredLockAmountInSatoshis);
      }
    });
  }

  getCurrentLockState () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const lastSavedLock = yield this.lockTransactionStore.getLastLock();
      if (!lastSavedLock) {
        return {
          activeValueTimeLock: undefined,
          latestSavedLockInfo: undefined,
          status: LockStatus.None
        };
      }
      Logger_1.default.info(`Found last saved lock of type: ${lastSavedLock.type} with transaction id: ${lastSavedLock.transactionId}.`);
      if (!(yield this.isTransactionBroadcasted(lastSavedLock.transactionId))) {
        return {
          activeValueTimeLock: undefined,
          latestSavedLockInfo: lastSavedLock,
          status: LockStatus.Pending
        };
      }
      if (lastSavedLock.type === SavedLockType_1.default.ReturnToWallet) {
        return {
          activeValueTimeLock: undefined,
          latestSavedLockInfo: lastSavedLock,
          status: LockStatus.None
        };
      }
      const lastLockIdentifier = {
        transactionId: lastSavedLock.transactionId,
        redeemScriptAsHex: lastSavedLock.redeemScriptAsHex
      };
      try {
        const currentValueTimeLock = yield this.lockResolver.resolveLockIdentifierAndThrowOnError(lastLockIdentifier);
        Logger_1.default.info(`Found a valid current lock: ${JSON.stringify(currentValueTimeLock)}`);
        return {
          activeValueTimeLock: currentValueTimeLock,
          latestSavedLockInfo: lastSavedLock,
          status: LockStatus.Confirmed
        };
      } catch (e) {
        if (e instanceof SidetreeError_1.default &&
                    (e.code === ErrorCode_1.default.LockResolverTransactionNotConfirmed || e.code === ErrorCode_1.default.NormalizedFeeCalculatorBlockNotFound)) {
          return {
            activeValueTimeLock: undefined,
            latestSavedLockInfo: lastSavedLock,
            status: LockStatus.Pending
          };
        }
        throw e;
      }
    });
  }

  rebroadcastTransaction (lastSavedLock) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      Logger_1.default.info(`Rebroadcasting the transaction id: ${lastSavedLock.transactionId}`);
      const lockTransactionFromLastSavedLock = {
        redeemScriptAsHex: lastSavedLock.redeemScriptAsHex,
        serializedTransactionObject: lastSavedLock.rawTransaction,
        transactionId: lastSavedLock.transactionId,
        transactionFee: 0
      };
      yield this.bitcoinClient.broadcastLockTransaction(lockTransactionFromLastSavedLock);
    });
  }

  isTransactionBroadcasted (transactionId) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      try {
        yield this.bitcoinClient.getRawTransaction(transactionId);
        return true;
      } catch (e) {
        Logger_1.default.warn(`Transaction with id: ${transactionId} was not found on the bitcoin. Error: ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`);
      }
      return false;
    });
  }

  handleCreatingNewLock (desiredLockAmountInSatoshis) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const totalLockAmount = desiredLockAmountInSatoshis + this.transactionFeesAmountInSatoshis;
      const walletBalance = yield this.bitcoinClient.getBalanceInSatoshis();
      if (walletBalance <= totalLockAmount) {
        throw new SidetreeError_1.default(ErrorCode_1.default.LockMonitorNotEnoughBalanceForFirstLock, `Lock amount: ${totalLockAmount}; Wallet balance: ${walletBalance}`);
      }
      Logger_1.default.info(LogColor_1.default.lightBlue(`Current wallet balance: ${LogColor_1.default.green(walletBalance)}`));
      Logger_1.default.info(LogColor_1.default.lightBlue(`Creating a new lock for amount: ${LogColor_1.default.green(totalLockAmount)} satoshis.`));
      const height = yield this.bitcoinClient.getCurrentBlockHeight();
      const lockTransaction = yield this.bitcoinClient.createLockTransaction(totalLockAmount, this.versionManager.getLockDurationInBlocks(height));
      const savedLockModel = yield this.saveThenBroadcastTransaction(lockTransaction, SavedLockType_1.default.Create, desiredLockAmountInSatoshis);
      EventEmitter_1.default.emit(EventCode_1.default.BitcoinLockMonitorNewLock);
      return savedLockModel;
    });
  }

  handleExistingLockRenewal (currentValueTimeLock, latestSavedLockInfo, desiredLockAmountInSatoshis) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (!(yield this.isUnlockTimeReached(currentValueTimeLock.unlockTransactionTime))) {
        return false;
      }
      if (latestSavedLockInfo.desiredLockAmountInSatoshis !== desiredLockAmountInSatoshis) {
        Logger_1.default.info(LogColor_1.default.lightBlue(`Current desired lock amount ${LogColor_1.default.green(desiredLockAmountInSatoshis)} satoshis is different from the previous `) +
                    LogColor_1.default.lightBlue(`desired lock amount ${LogColor_1.default.green(latestSavedLockInfo.desiredLockAmountInSatoshis)} satoshis. Going to release the lock.`));
        yield this.releaseLock(currentValueTimeLock, desiredLockAmountInSatoshis);
        return true;
      }
      try {
        yield this.renewLock(currentValueTimeLock, desiredLockAmountInSatoshis);
        EventEmitter_1.default.emit(EventCode_1.default.BitcoinLockMonitorLockRenewed);
      } catch (e) {
        if (e instanceof SidetreeError_1.default && e.code === ErrorCode_1.default.LockMonitorNotEnoughBalanceForRelock) {
          Logger_1.default.warn(LogColor_1.default.yellow(`There is not enough balance for relocking so going to release the lock. Error: ${e.message}`));
          yield this.releaseLock(currentValueTimeLock, desiredLockAmountInSatoshis);
        } else {
          throw (e);
        }
      }
      return true;
    });
  }

  handleReleaseExistingLock (currentValueTimeLock, desiredLockAmountInSatoshis) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (!(yield this.isUnlockTimeReached(currentValueTimeLock.unlockTransactionTime))) {
        return false;
      }
      Logger_1.default.info(LogColor_1.default.lightBlue(`Value time lock no longer needed and unlock time reached, releasing lock...`));
      yield this.releaseLock(currentValueTimeLock, desiredLockAmountInSatoshis);
      Logger_1.default.info(LogColor_1.default.lightBlue(`Value time lock released.`));
      return true;
    });
  }

  renewLock (currentValueTimeLock, desiredLockAmountInSatoshis) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const currentLockIdentifier = LockIdentifierSerializer_1.default.deserialize(currentValueTimeLock.identifier);
      const currentLockDuration = currentValueTimeLock.unlockTransactionTime - currentValueTimeLock.lockTransactionTime;
      const newLockDuration = this.versionManager.getLockDurationInBlocks(yield this.bitcoinClient.getCurrentBlockHeight());
      const relockTransaction = yield this.bitcoinClient.createRelockTransaction(currentLockIdentifier.transactionId, currentLockDuration, newLockDuration);
      if (currentValueTimeLock.amountLocked - relockTransaction.transactionFee < desiredLockAmountInSatoshis) {
        throw new SidetreeError_1.default(ErrorCode_1.default.LockMonitorNotEnoughBalanceForRelock, `The current locked amount (${currentValueTimeLock.amountLocked} satoshis) minus the relocking fee (${relockTransaction.transactionFee} satoshis) is causing the relock amount to go below the desired lock amount: ${desiredLockAmountInSatoshis}`);
      }
      return this.saveThenBroadcastTransaction(relockTransaction, SavedLockType_1.default.Relock, desiredLockAmountInSatoshis);
    });
  }

  releaseLock (currentValueTimeLock, desiredLockAmountInSatoshis) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const currentLockIdentifier = LockIdentifierSerializer_1.default.deserialize(currentValueTimeLock.identifier);
      const currentLockDuration = currentValueTimeLock.unlockTransactionTime - currentValueTimeLock.lockTransactionTime;
      const releaseLockTransaction = yield this.bitcoinClient.createReleaseLockTransaction(currentLockIdentifier.transactionId, currentLockDuration);
      const savedLockModel = yield this.saveThenBroadcastTransaction(releaseLockTransaction, SavedLockType_1.default.ReturnToWallet, desiredLockAmountInSatoshis);
      EventEmitter_1.default.emit(EventCode_1.default.BitcoinLockMonitorLockReleased);
      return savedLockModel;
    });
  }

  saveThenBroadcastTransaction (lockTransaction, lockType, desiredLockAmountInSatoshis) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const lockInfoToSave = {
        desiredLockAmountInSatoshis: desiredLockAmountInSatoshis,
        rawTransaction: lockTransaction.serializedTransactionObject,
        transactionId: lockTransaction.transactionId,
        redeemScriptAsHex: lockTransaction.redeemScriptAsHex,
        createTimestamp: Date.now(),
        type: lockType
      };
      Logger_1.default.info(`Saving the ${lockType} type lock with transaction id: ${lockTransaction.transactionId}.`);
      yield this.lockTransactionStore.addLock(lockInfoToSave);
      Logger_1.default.info(`Broadcasting the transaction id: ${lockTransaction.transactionId}`);
      yield this.bitcoinClient.broadcastLockTransaction(lockTransaction);
      return lockInfoToSave;
    });
  }

  isUnlockTimeReached (unlockTransactionTime) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const currentBlockTime = yield this.bitcoinClient.getCurrentBlockHeight();
      Logger_1.default.info(`Current block: ${currentBlockTime}; Current lock's unlock block: ${unlockTransactionTime}`);
      return currentBlockTime >= unlockTransactionTime;
    });
  }
}
exports.default = LockMonitor;
// # sourceMappingURL=LockMonitor.js.map
