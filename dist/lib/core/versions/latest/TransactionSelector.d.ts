import ITransactionSelector from '../../interfaces/ITransactionSelector';
import ITransactionStore from '../../interfaces/ITransactionStore';
import TransactionModel from '../../../common/models/TransactionModel';
export default class TransactionSelector implements ITransactionSelector {
    private transactionStore;
    private maxNumberOfOperationsPerBlock;
    private maxNumberOfTransactionsPerBlock;
    constructor(transactionStore: ITransactionStore);
    private static getTransactionPriorityQueue;
    selectQualifiedTransactions(transactions: TransactionModel[]): Promise<TransactionModel[]>;
    private static validateTransactions;
    private static enqueueFirstTransactionFromEachWriter;
    private getNumberOfOperationsAndTransactionsAlreadyInTransactionTime;
    private static getHighestFeeTransactionsFromCurrentTransactionTime;
}
