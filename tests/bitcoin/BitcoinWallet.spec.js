'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const BitcoinClient_1 = require('../../lib/bitcoin/BitcoinClient');
const BitcoinDataGenerator_1 = require('./BitcoinDataGenerator');
const BitcoinWallet_1 = require('../../lib/bitcoin/BitcoinWallet');
const ErrorCode_1 = require('../../lib/bitcoin/ErrorCode');
const JasmineSidetreeErrorValidator_1 = require('../JasmineSidetreeErrorValidator');
const bitcore_lib_1 = require('bitcore-lib');
describe('BitcoinWallet', () => {
  let wallet;
  let bitcoinWalletImportString;
  beforeAll(() => {
    bitcoinWalletImportString = BitcoinClient_1.default.generatePrivateKey('testnet');
  });
  beforeEach(() => {
    wallet = new BitcoinWallet_1.default(bitcoinWalletImportString);
  });
  describe('constructor', () => {
    it('should throw if the import wallet string is incorrect', () => {
      JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => new BitcoinWallet_1.default('some invalid string'), ErrorCode_1.default.BitcoinWalletIncorrectImportString);
    });
  });
  describe('signTransaction', () => {
    it('should call the transaction objects sign function', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const transaction = BitcoinDataGenerator_1.default.generateBitcoinTransaction(bitcoinWalletImportString, 10);
      const signSpy = spyOn(transaction, 'sign').and.returnValue(transaction);
      const actual = yield wallet.signTransaction(transaction);
      expect(actual).toEqual(transaction);
      expect(signSpy).toHaveBeenCalled();
      done();
    }));
  });
  describe('signFreezeTransaction', () => {
    it('should call the other function for signing.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const transaction = BitcoinDataGenerator_1.default.generateBitcoinTransaction(bitcoinWalletImportString, 10);
      const signTxnSpy = spyOn(wallet, 'signTransaction').and.returnValue(Promise.resolve(transaction));
      const outputRedeemScript = bitcore_lib_1.Script.empty();
      const actual = yield wallet.signFreezeTransaction(transaction, outputRedeemScript);
      expect(signTxnSpy).toHaveBeenCalled();
      expect(actual).toEqual(transaction);
      done();
    }));
  });
  describe('signSpendFromFreezeTransaction', () => {
    it('should sign the transaction correctly.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const unspentCoins = BitcoinDataGenerator_1.default.generateUnspentCoin(bitcoinWalletImportString, 1000);
      const transaction = BitcoinDataGenerator_1.default.generateBitcoinTransaction(bitcoinWalletImportString, 10);
      transaction.from([unspentCoins]);
      const inputRedeemScript = bitcore_lib_1.Script.empty().add(117).add(177);
      const outputRedeemScript = bitcore_lib_1.Script.empty();
      const actual = yield wallet.signSpendFromFreezeTransaction(transaction, inputRedeemScript, outputRedeemScript);
      expect(actual).toEqual(transaction);
      const inputScriptAsm = actual.inputs[0].script.toASM();
      const inputScriptAsmParts = inputScriptAsm.split(' ');
      expect(inputScriptAsmParts.length).toEqual(3);
      expect(inputScriptAsmParts[0].length).toBeGreaterThan(0);
      expect(inputScriptAsmParts[1]).toEqual(wallet['walletPublicKeyAsBuffer'].toString('hex'));
      expect(inputScriptAsmParts[2]).toEqual(inputRedeemScript.toBuffer().toString('hex'));
      done();
    }));
  });
});
// # sourceMappingURL=BitcoinWallet.spec.js.map
