import BitcoinTransactionModel from './BitcoinTransactionModel.ts';

/**
 * Encapsulates the block data returned by the bitcoin service or block parsed directly from file.
 */
export interface BitcoinBlockModel {
  hash: string;
  height: number;
  previousHash: string;
  transactions: BitcoinTransactionModel[];
}
