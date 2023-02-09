import BitcoinTransactionModel from './BitcoinTransactionModel';
export default interface BitcoinBlockModel {
    hash: string;
    height: number;
    previousHash: string;
    transactions: BitcoinTransactionModel[];
}
