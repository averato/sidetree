"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const AnchoredDataSerializer_1 = tslib_1.__importDefault(require("./AnchoredDataSerializer"));
const ErrorCode_1 = tslib_1.__importDefault(require("./ErrorCode"));
const Logger_1 = tslib_1.__importDefault(require("../../../common/Logger"));
const priorityqueue_1 = tslib_1.__importDefault(require("priorityqueue"));
const ProtocolParameters_1 = tslib_1.__importDefault(require("./ProtocolParameters"));
const SidetreeError_1 = tslib_1.__importDefault(require("../../../common/SidetreeError"));
class TransactionSelector {
    constructor(transactionStore) {
        this.transactionStore = transactionStore;
        this.maxNumberOfOperationsPerBlock = ProtocolParameters_1.default.maxNumberOfOperationsPerTransactionTime;
        this.maxNumberOfTransactionsPerBlock = ProtocolParameters_1.default.maxNumberOfTransactionsPerTransactionTime;
    }
    static getTransactionPriorityQueue() {
        const comparator = (a, b) => {
            return a.transactionFeePaid - b.transactionFeePaid || b.transactionNumber - a.transactionNumber;
        };
        return new priorityqueue_1.default({ comparator });
    }
    selectQualifiedTransactions(transactions) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!transactions.length) {
                return [];
            }
            const transactionsPriorityQueue = TransactionSelector.getTransactionPriorityQueue();
            const currentTransactionTime = transactions[0].transactionTime;
            TransactionSelector.validateTransactions(transactions, currentTransactionTime);
            TransactionSelector.enqueueFirstTransactionFromEachWriter(transactions, currentTransactionTime, transactionsPriorityQueue);
            const [numberOfOperations, numberOfTransactions] = yield this.getNumberOfOperationsAndTransactionsAlreadyInTransactionTime(currentTransactionTime);
            const numberOfOperationsToQualify = this.maxNumberOfOperationsPerBlock - numberOfOperations;
            const numberOfTransactionsToQualify = this.maxNumberOfTransactionsPerBlock - numberOfTransactions;
            const transactionsToReturn = TransactionSelector.getHighestFeeTransactionsFromCurrentTransactionTime(numberOfOperationsToQualify, numberOfTransactionsToQualify, transactionsPriorityQueue);
            return transactionsToReturn;
        });
    }
    static validateTransactions(transactions, currentTransactionTime) {
        for (const transaction of transactions) {
            if (transaction.transactionTime !== currentTransactionTime) {
                throw new SidetreeError_1.default(ErrorCode_1.default.TransactionsNotInSameBlock, 'transaction must be in the same block to perform rate limiting, investigate and fix');
            }
        }
    }
    static enqueueFirstTransactionFromEachWriter(transactions, currentTransactionTime, transactionsPriorityQueue) {
        const writerToTransactionNumberMap = new Map();
        for (const transaction of transactions) {
            if (writerToTransactionNumberMap.has(transaction.writer)) {
                const acceptedTransactionNumber = writerToTransactionNumberMap.get(transaction.writer);
                Logger_1.default.info(`Multiple transactions found in transaction time ${currentTransactionTime} from writer ${transaction.writer}, considering transaction ${acceptedTransactionNumber} and ignoring ${transaction.transactionNumber}`);
            }
            else {
                transactionsPriorityQueue.push(transaction);
                writerToTransactionNumberMap.set(transaction.writer, transaction.transactionNumber);
            }
        }
    }
    getNumberOfOperationsAndTransactionsAlreadyInTransactionTime(transactionTime) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const transactions = yield this.transactionStore.getTransactionsStartingFrom(transactionTime, transactionTime);
            let numberOfOperations = 0;
            if (transactions) {
                for (const transaction of transactions) {
                    try {
                        const numOfOperationsInCurrentTransaction = AnchoredDataSerializer_1.default.deserialize(transaction.anchorString).numberOfOperations;
                        numberOfOperations += numOfOperationsInCurrentTransaction;
                    }
                    catch (e) {
                        Logger_1.default.info(`Error thrown in TransactionSelector: ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`);
                        Logger_1.default.info(`Transaction with anchor string ${transaction.anchorString} not considered as selected.`);
                    }
                }
            }
            const numberOfTransactions = transactions ? transactions.length : 0;
            return [numberOfOperations, numberOfTransactions];
        });
    }
    static getHighestFeeTransactionsFromCurrentTransactionTime(numberOfOperationsToQualify, numberOfTransactionsToQualify, transactionsPriorityQueue) {
        let numberOfOperationsSeen = 0;
        const transactionsToReturn = [];
        while (transactionsToReturn.length < numberOfTransactionsToQualify &&
            numberOfOperationsSeen < numberOfOperationsToQualify &&
            transactionsPriorityQueue.length > 0) {
            const currentTransaction = transactionsPriorityQueue.pop();
            try {
                const numOfOperationsInCurrentTransaction = AnchoredDataSerializer_1.default.deserialize(currentTransaction.anchorString).numberOfOperations;
                numberOfOperationsSeen += numOfOperationsInCurrentTransaction;
                if (numberOfOperationsSeen <= numberOfOperationsToQualify) {
                    transactionsToReturn.push(currentTransaction);
                }
            }
            catch (e) {
                Logger_1.default.info(`Error thrown in TransactionSelector: ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`);
                Logger_1.default.info(`Transaction with anchor string ${currentTransaction.anchorString} not selected`);
            }
        }
        return transactionsToReturn;
    }
}
exports.default = TransactionSelector;
//# sourceMappingURL=TransactionSelector.js.map