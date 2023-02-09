/// <reference types="node" />
import BitcoinBlockModel from './models/BitcoinBlockModel';
export default class BitcoinRawDataParser {
    private static magicBytes;
    private static magicBytesLength;
    private static sizeBytesLength;
    static parseRawDataFile(rawBlockDataFileBuffer: Buffer): BitcoinBlockModel[];
    private static getBlockHeightFromBlock;
}
