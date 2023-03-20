"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Logger_1 = tslib_1.__importDefault(require("../common/Logger"));
const TransactionNumber_1 = tslib_1.__importDefault(require("./TransactionNumber"));
class SpendingMonitor {
    constructor(bitcoinFeeSpendingCutoffPeriodInBlocks, bitcoinFeeSpendingCutoffInSatoshis, transactionStore) {
        this.bitcoinFeeSpendingCutoffPeriodInBlocks = bitcoinFeeSpendingCutoffPeriodInBlocks;
        this.bitcoinFeeSpendingCutoffInSatoshis = bitcoinFeeSpendingCutoffInSatoshis;
        this.transactionStore = transactionStore;
        if (bitcoinFeeSpendingCutoffPeriodInBlocks < 1) {
            throw new Error(`Bitcoin spending cutoff period: ${bitcoinFeeSpendingCutoffPeriodInBlocks} must be greater than 1`);
        }
        if (bitcoinFeeSpendingCutoffInSatoshis <= 0) {
            throw new Error('Bitcoin spending cutoff amount must be > 0');
        }
        this.anchorStringsWritten = new Set();
    }
    addTransactionDataBeingWritten(anchorString) {
        this.anchorStringsWritten.add(anchorString);
    }
    isCurrentFeeWithinSpendingLimit(currentFeeInSatoshis, lastProcessedBlockHeight) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.bitcoinFeeSpendingCutoffPeriodInBlocks === 1) {
                return (currentFeeInSatoshis <= this.bitcoinFeeSpendingCutoffInSatoshis);
            }
            const startingBlockHeight = lastProcessedBlockHeight - this.bitcoinFeeSpendingCutoffPeriodInBlocks - 2;
            const startingBlockFirstTxnNumber = TransactionNumber_1.default.construct(startingBlockHeight, 0);
            const allTxnsSinceStartingBlock = yield this.transactionStore.getTransactionsLaterThan(startingBlockFirstTxnNumber - 1, undefined);
            Logger_1.default.info(`SpendingMonitor: total number of transactions from the transaction store starting from block: ${startingBlockHeight} are: ${allTxnsSinceStartingBlock.length}`);
            const txnsWrittenByThisInstance = this.findTransactionsWrittenByThisNode(allTxnsSinceStartingBlock);
            Logger_1.default.info(`Number of transactions written by this instance: ${txnsWrittenByThisInstance.length}`);
            const totalFeeForRelatedTxns = txnsWrittenByThisInstance.reduce((total, currTxnModel) => {
                return total + currTxnModel.transactionFeePaid;
            }, 0);
            const totalFeePlusCurrentFee = totalFeeForRelatedTxns + currentFeeInSatoshis;
            if (totalFeePlusCurrentFee > this.bitcoinFeeSpendingCutoffInSatoshis) {
                Logger_1.default.error(`Current fee (in satoshis): ${currentFeeInSatoshis} + total fees (${totalFeeForRelatedTxns}) since block number: ${startingBlockHeight} is greater than the spending cap: ${this.bitcoinFeeSpendingCutoffInSatoshis}`);
                return false;
            }
            return true;
        });
    }
    findTransactionsWrittenByThisNode(transactionsFromStore) {
        const arraysToReturn = transactionsFromStore.filter((txn) => {
            return this.anchorStringsWritten.has(txn.anchorString);
        });
        return arraysToReturn;
    }
}
exports.default = SpendingMonitor;
//# sourceMappingURL=SpendingMonitor.js.map