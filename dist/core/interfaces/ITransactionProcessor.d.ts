import TransactionModel from '../../common/models/TransactionModel';
export default interface ITransactionProcessor {
    processTransaction(transaction: TransactionModel): Promise<boolean>;
}
