export default class TransactionNumber {
    private static readonly maxTransactionIndexInBlock;
    private static readonly maxTransactionCountInBlock;
    static construct(blockNumber: number, transactionIndexInBlock: number): number;
    private static privateConstruct;
    static lastTransactionOfBlock(blockNumber: number): number;
    static getBlockNumber(transactionNumber: number): number;
}
