import BitcoinClient from './BitcoinClient';
import BitcoinTransactionModel from './models/BitcoinTransactionModel';
import SidetreeTransactionModel from './models/SidetreeTransactionModel';
export default class SidetreeTransactionParser {
    private bitcoinClient;
    private sidetreePrefix;
    constructor(bitcoinClient: BitcoinClient, sidetreePrefix: string);
    parse(bitcoinTransaction: BitcoinTransactionModel): Promise<SidetreeTransactionModel | undefined>;
    private getValidSidetreeDataFromOutputs;
    private getSidetreeDataFromOutputIfExist;
    private getValidWriterFromInputs;
    private fetchOutput;
    private getPublicKeyHashIfValidScript;
}
