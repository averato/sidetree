import TransactionModel from '../../common/models/TransactionModel';
export default interface ITransactionStore {
    addTransaction(transaction: TransactionModel): Promise<void>;
    getLastTransaction(): Promise<TransactionModel | undefined>;
    getExponentiallySpacedTransactions(): Promise<TransactionModel[]>;
    getTransaction(transactionNumber: number): Promise<TransactionModel | undefined>;
    getTransactionsStartingFrom(inclusiveBeginTransactionTime: number, exclusiveEndTransactionTime: number): Promise<TransactionModel[] | undefined>;
    getTransactionsLaterThan(transactionNumber: number | undefined, max: number | undefined): Promise<TransactionModel[]>;
    removeTransactionsLaterThan(transactionNumber?: number): Promise<void>;
}
