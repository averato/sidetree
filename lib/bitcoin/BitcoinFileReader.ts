// import * as fs from 'fs';
import ErrorCode from './ErrorCode.ts';
import IBitcoinFileReader from './interfaces/IBitcoinFileReader.ts';
import SidetreeError from '../common/SidetreeError.ts';

/**
 * concrete implementation of BitcoinFileReader
 */
export default class BitcoinFileReader implements IBitcoinFileReader {
  /**
   * Constructor
   * @param bitcoinDataDirectory The same directory used by bitcoin core
   */
  public constructor (private bitcoinDataDirectory: string) {}

  public listBlockFiles (): string[] {
    const blocksDataDirectoryPath = `${this.bitcoinDataDirectory}/blocks`;
    let blockDataDir;
    try {
      blockDataDir = Deno.readDirSync(blocksDataDirectoryPath); // fs.readdirSync(blocksDataDirectoryPath);
    } catch (e) {
      if (e instanceof SidetreeError) throw SidetreeError.createFromError(ErrorCode.BitcoinFileReaderBlockCannotReadDirectory, e);

      throw e;
    }
    const blockFileList = blockDataDir.filter((dirEntry) => { return dirEntry.name.startsWith('blk'); });
    return blockFileList;
  }

  public readBlockFile (fileName: string): Buffer {
    try {
      return Deno.readFileSync(`${this.bitcoinDataDirectory}/blocks/${fileName}`);
    } catch (e) {
      if (e instanceof SidetreeError) throw SidetreeError.createFromError(ErrorCode.BitcoinFileReaderBlockCannotReadFile, e);

      throw e;
    }
  }
}
