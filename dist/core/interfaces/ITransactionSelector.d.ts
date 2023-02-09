import TransactionModel from '../../common/models/TransactionModel';
export default interface ITransactionSelector {
    selectQualifiedTransactions(transactions: TransactionModel[]): Promise<TransactionModel[]>;
}
