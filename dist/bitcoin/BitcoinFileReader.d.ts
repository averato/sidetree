/// <reference types="node" />
import IBitcoinFileReader from './interfaces/IBitcoinFileReader';
export default class BitcoinFileReader implements IBitcoinFileReader {
    private bitcoinDataDirectory;
    constructor(bitcoinDataDirectory: string);
    listBlockFiles(): string[];
    readBlockFile(fileName: string): Buffer;
}
