import { Transaction } from 'bitcore-lib';
import BitcoinBlockModel from '../../lib/bitcoin/models/BitcoinBlockModel';
export default class BitcoinDataGenerator {
    private static randomString;
    private static randomNumber;
    static generateBitcoinTransaction(wif: string, satoshis?: number): Transaction;
    static generateUnspentCoin(wif: string, satoshis: number): Transaction.UnspentOutput;
    static generateBlock(blockHeight: number, data?: () => string | string[] | undefined): BitcoinBlockModel;
}
