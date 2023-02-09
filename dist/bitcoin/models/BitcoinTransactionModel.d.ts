import BitcoinInputModel from './BitcoinInputModel';
import BitcoinOutputModel from './BitcoinOutputModel';
export default interface BitcoinTransactionModel {
    outputs: BitcoinOutputModel[];
    inputs: BitcoinInputModel[];
    id: string;
    blockHash: string;
    confirmations: number;
}
