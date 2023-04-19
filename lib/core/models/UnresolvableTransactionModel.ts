import TransactionModel from '../../common/models/TransactionModel.ts';

/**
 * Unresolvable transaction model.
 */
export default
interface UnresolvableTransactionModel extends TransactionModel {
  firstFetchTime: number;
  retryAttempts: number;
  nextRetryTime: number;
}
