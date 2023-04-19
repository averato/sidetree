import BitcoinInputModel from './BitcoinInputModel.ts';
import BitcoinOutputModel from './BitcoinOutputModel.ts';

/**
 * Encapsulates data for a bitcoin transaction.
 */
export default interface BitcoinTransactionModel {
  outputs: BitcoinOutputModel[];
  inputs: BitcoinInputModel[];
  id: string;

  /** Hash of the corresponding block which has this transaction */
  blockHash: string;

  /** The number of confirmations for this transaction */
  confirmations: number;
}
