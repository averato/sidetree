import IUnresolvableTransactionStore from './interfaces/IUnresolvableTransactionStore';
import MongoDbStore from '../common/MongoDbStore';
import TransactionModel from '../common/models/TransactionModel';
import UnresolvableTransactionModel from './models/UnresolvableTransactionModel';
export default class MongoDbUnresolvableTransactionStore extends MongoDbStore implements IUnresolvableTransactionStore {
    static readonly unresolvableTransactionCollectionName: string;
    private exponentialDelayFactorInMilliseconds;
    private maximumUnresolvableTransactionReturnCount;
    constructor(serverUrl: string, databaseName: string, retryExponentialDelayFactor?: number);
    recordUnresolvableTransactionFetchAttempt(transaction: TransactionModel): Promise<void>;
    removeUnresolvableTransaction(transaction: TransactionModel): Promise<void>;
    getUnresolvableTransactionsDueForRetry(maximumReturnCount?: number): Promise<TransactionModel[]>;
    removeUnresolvableTransactionsLaterThan(transactionNumber?: number): Promise<void>;
    getUnresolvableTransactions(): Promise<UnresolvableTransactionModel[]>;
    createIndex(): Promise<void>;
}
