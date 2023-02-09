"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorCode_1 = require("./ErrorCode");
const SidetreeError_1 = require("../common/SidetreeError");
class TransactionNumber {
    static construct(blockNumber, transactionIndexInBlock) {
        if (transactionIndexInBlock > TransactionNumber.maxTransactionIndexInBlock) {
            throw new SidetreeError_1.default(ErrorCode_1.default.TransactionNumberTransactionIndexInBlockTooLarge, `Position index ${transactionIndexInBlock} given exceeds max allowed value of ${TransactionNumber.maxTransactionIndexInBlock}`);
        }
        const maxBlockNumber = 9000000000;
        if (blockNumber > maxBlockNumber) {
            throw new SidetreeError_1.default(ErrorCode_1.default.TransactionNumberBlockNumberTooLarge, `Block number ${blockNumber} given exceeds max allowed value of ${maxBlockNumber}`);
        }
        const transactionNumber = TransactionNumber.privateConstruct(blockNumber, transactionIndexInBlock);
        return transactionNumber;
    }
    static privateConstruct(blockNumber, transactionIndexInBlock) {
        const transactionNumber = blockNumber * TransactionNumber.maxTransactionCountInBlock + transactionIndexInBlock;
        return transactionNumber;
    }
    static lastTransactionOfBlock(blockNumber) {
        return TransactionNumber.privateConstruct(blockNumber, TransactionNumber.maxTransactionIndexInBlock);
    }
    static getBlockNumber(transactionNumber) {
        const blockNumber = Math.trunc(transactionNumber / TransactionNumber.maxTransactionCountInBlock);
        return blockNumber;
    }
}
exports.default = TransactionNumber;
TransactionNumber.maxTransactionIndexInBlock = 999999;
TransactionNumber.maxTransactionCountInBlock = TransactionNumber.maxTransactionIndexInBlock + 1;
//# sourceMappingURL=TransactionNumber.js.map