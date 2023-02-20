'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const fs = require('fs');
const ErrorCode_1 = require('./ErrorCode');
const SidetreeError_1 = require('../common/SidetreeError');
class BitcoinFileReader {
  constructor (bitcoinDataDirectory) {
    this.bitcoinDataDirectory = bitcoinDataDirectory;
  }

  listBlockFiles () {
    const blocksDataDirectoryPath = `${this.bitcoinDataDirectory}/blocks`;
    let blockDataDir;
    try {
      blockDataDir = fs.readdirSync(blocksDataDirectoryPath);
    } catch (e) {
      if (e instanceof SidetreeError_1.default) { throw SidetreeError_1.default.createFromError(ErrorCode_1.default.BitcoinFileReaderBlockCannotReadDirectory, e); }
      throw e;
    }
    const blockFileList = blockDataDir.filter((fileName) => { return fileName.startsWith('blk'); });
    return blockFileList;
  }

  readBlockFile (fileName) {
    try {
      return fs.readFileSync(`${this.bitcoinDataDirectory}/blocks/${fileName}`);
    } catch (e) {
      if (e instanceof SidetreeError_1.default) { throw SidetreeError_1.default.createFromError(ErrorCode_1.default.BitcoinFileReaderBlockCannotReadFile, e); }
      throw e;
    }
  }
}
exports.default = BitcoinFileReader;
// # sourceMappingURL=BitcoinFileReader.js.map
