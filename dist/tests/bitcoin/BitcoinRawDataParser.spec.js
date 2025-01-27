'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const fs = require('fs');
const BitcoinRawDataParser_1 = require('../../lib/bitcoin/BitcoinRawDataParser');
const ErrorCode_1 = require('../../lib/bitcoin/ErrorCode');
const SidetreeError_1 = require('../../lib/common/SidetreeError');
describe('BitcoinRawDataParser', () => {
  describe('parseRawDataFile', () => {
    it('should parse block files', () => {
      const hex = fs.readFileSync('tests/bitcoin/testData/bitcoinTwoBlocksRawDataHex.txt', 'utf8');
      const blockDataFileBuffer = Buffer.from(hex, 'hex');
      const result = BitcoinRawDataParser_1.default.parseRawDataFile(blockDataFileBuffer);
      expect(result).toBeDefined();
      expect(result.length).toEqual(2);
    });
    it('should handle skip magic bytes', () => {
      const blockDataFileBuffer = Buffer.from('0000000000000000', 'hex');
      const result = BitcoinRawDataParser_1.default.parseRawDataFile(blockDataFileBuffer);
      expect(result).toEqual([]);
    });
    it('should handle invalid magic bytes', () => {
      const blockDataFileBuffer = Buffer.from('ffffffffffffffff', 'hex');
      expect(() => {
        BitcoinRawDataParser_1.default.parseRawDataFile(blockDataFileBuffer);
      }).toThrow(new SidetreeError_1.default(ErrorCode_1.default.BitcoinRawDataParserInvalidMagicBytes, 'ffffffff at cursor position 0 is not valid bitcoin mainnet, testnet or regtest magic bytes'));
    });
    it('should handle invalid raw block files', () => {
      const blockDataFileBuffer = Buffer.from('0b11090700000000', 'hex');
      expect(() => {
        BitcoinRawDataParser_1.default.parseRawDataFile(blockDataFileBuffer);
      }).toThrow(new SidetreeError_1.default(ErrorCode_1.default.BitcoinRawDataParserInvalidBlockData, 'Invalid state: No block data received'));
    });
  });
  describe('getBlockHeightFromBlock', () => {
    it('should process blocks correctly', () => {
      const expectedBlockHeight = 10000;
      const mockBlock = {
        transactions: [
          {
            inputs: [
              {
                _scriptBuffer: {
                  readUInt8: () => { return 123; },
                  readUIntLE: () => { return expectedBlockHeight; }
                }
              }
            ]
          }
        ]
      };
      const mainnetMagicBytes = Buffer.from('f9beb4d9', 'hex');
      const height = BitcoinRawDataParser_1.default['getBlockHeightFromBlock'](mockBlock, mainnetMagicBytes);
      expect(height).toEqual(expectedBlockHeight);
    });
    it('should process regtest blocks under height 17 correctly', () => {
      const mockBlock = {
        transactions: [
          {
            inputs: [
              {
                _scriptBuffer: {
                  readUInt8: () => { return 96; }
                }
              }
            ]
          }
        ]
      };
      const regtestMagicBytes = Buffer.from('fabfb5da', 'hex');
      const height = BitcoinRawDataParser_1.default['getBlockHeightFromBlock'](mockBlock, regtestMagicBytes);
      expect(height).toEqual(16);
    });
  });
});
// # sourceMappingURL=BitcoinRawDataParser.spec.js.map
