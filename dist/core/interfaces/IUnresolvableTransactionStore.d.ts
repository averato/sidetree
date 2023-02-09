import TransactionModel from '../../common/models/TransactionModel';
export default interface IUnresolvableTransactionStore {
    recordUnresolvableTransactionFetchAttempt(transaction: TransactionModel): Promise<void>;
    removeUnresolvableTransaction(transaction: TransactionModel): Promise<void>;
    getUnresolvableTransactionsDueForRetry(maxReturnCount?: number): Promise<TransactionModel[]>;
    removeUnresolvableTransactionsLaterThan(transactionNumber?: number): Promise<void>;
}
