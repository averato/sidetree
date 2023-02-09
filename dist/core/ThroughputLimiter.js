"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
class ThroughputLimiter {
    constructor(versionManager) {
        this.versionManager = versionManager;
    }
    getQualifiedTransactions(transactions) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let currentTransactionTime;
            const transactionsGroupedByTransactionTime = [];
            for (const transaction of transactions) {
                if (transaction.transactionTime !== currentTransactionTime) {
                    transactionsGroupedByTransactionTime.push([]);
                    currentTransactionTime = transaction.transactionTime;
                }
                transactionsGroupedByTransactionTime[transactionsGroupedByTransactionTime.length - 1].push(transaction);
            }
            const qualifiedTransactions = [];
            for (const transactionGroup of transactionsGroupedByTransactionTime) {
                const transactionSelector = this.versionManager.getTransactionSelector(transactionGroup[0].transactionTime);
                const qualifiedTransactionsInCurrentGroup = yield transactionSelector.selectQualifiedTransactions(transactionGroup);
                qualifiedTransactions.push(...qualifiedTransactionsInCurrentGroup);
            }
            return qualifiedTransactions;
        });
    }
}
exports.default = ThroughputLimiter;
//# sourceMappingURL=ThroughputLimiter.js.map