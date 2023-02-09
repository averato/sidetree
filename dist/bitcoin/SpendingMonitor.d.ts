import ITransactionStore from '../core/interfaces/ITransactionStore';
export default class SpendingMonitor {
    private bitcoinFeeSpendingCutoffPeriodInBlocks;
    private bitcoinFeeSpendingCutoffInSatoshis;
    private transactionStore;
    private anchorStringsWritten;
    constructor(bitcoinFeeSpendingCutoffPeriodInBlocks: number, bitcoinFeeSpendingCutoffInSatoshis: number, transactionStore: ITransactionStore);
    addTransactionDataBeingWritten(anchorString: string): void;
    isCurrentFeeWithinSpendingLimit(currentFeeInSatoshis: number, lastProcessedBlockHeight: number): Promise<boolean>;
    private findTransactionsWrittenByThisNode;
}
