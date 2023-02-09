import TransactionModel from '../../common/models/TransactionModel';
export default interface UnresolvableTransactionModel extends TransactionModel {
    firstFetchTime: number;
    retryAttempts: number;
    nextRetryTime: number;
}
