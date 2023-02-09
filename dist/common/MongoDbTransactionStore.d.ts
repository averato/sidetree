import ITransactionStore from '../core/interfaces/ITransactionStore';
import MongoDbStore from './MongoDbStore';
import TransactionModel from './models/TransactionModel';
export default class MongoDbTransactionStore extends MongoDbStore implements ITransactionStore {
    static readonly transactionCollectionName: string;
    constructor(serverUrl: string, databaseName: string);
    getTransactionsCount(): Promise<number>;
    getTransaction(transactionNumber: number): Promise<TransactionModel | undefined>;
    getTransactionsLaterThan(transactionNumber: number | undefined, max: number | undefined): Promise<TransactionModel[]>;
    addTransaction(transaction: TransactionModel): Promise<void>;
    getLastTransaction(): Promise<TransactionModel | undefined>;
    getExponentiallySpacedTransactions(): Promise<TransactionModel[]>;
    removeTransactionsLaterThan(transactionNumber?: number): Promise<void>;
    removeTransactionByTransactionTimeHash(transactionTimeHash: string): Promise<void>;
    getTransactions(): Promise<TransactionModel[]>;
    getTransactionsStartingFrom(inclusiveBeginTransactionTime: number, exclusiveEndTransactionTime: number): Promise<TransactionModel[]>;
    createIndex(): Promise<void>;
}
