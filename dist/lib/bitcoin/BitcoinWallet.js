'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const bitcore_lib_1 = require('bitcore-lib');
const ErrorCode_1 = require('./ErrorCode');
const SidetreeError_1 = require('../common/SidetreeError');
class BitcoinWallet {
  constructor (bitcoinWalletImportString) {
    try {
      this.walletPrivateKey = bitcore_lib_1.PrivateKey.fromWIF(bitcoinWalletImportString);
    } catch (error) {
      throw SidetreeError_1.default.createFromError(ErrorCode_1.default.BitcoinWalletIncorrectImportString, error);
    }
    this.walletAddress = this.walletPrivateKey.toAddress();
    const walletPublicKey = this.walletPrivateKey.toPublicKey();
    this.walletPublicKeyAsBuffer = walletPublicKey.toBuffer();
    this.walletPublicKeyAsHex = this.walletPublicKeyAsBuffer.toString('hex');
  }

  getPublicKeyAsHex () {
    return this.walletPublicKeyAsHex;
  }

  getAddress () {
    return this.walletAddress;
  }

  signTransaction (transaction) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      return transaction.sign(this.walletPrivateKey);
    });
  }

  signFreezeTransaction (transaction, _outputRedeemScript) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      return this.signTransaction(transaction);
    });
  }

  signSpendFromFreezeTransaction (lockTransaction, inputRedeemScript, _outputRedeemScript) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const signatureType = 0x1;
      const inputIndexToSign = 0;
      const signature = bitcore_lib_1.Transaction.sighash.sign(lockTransaction, this.walletPrivateKey, signatureType, inputIndexToSign, inputRedeemScript);
      const inputScript = bitcore_lib_1.Script.empty()
        .add(signature.toTxFormat())
        .add(this.walletPublicKeyAsBuffer)
        .add(inputRedeemScript.toBuffer());
      lockTransaction.inputs[0].setScript(inputScript);
      return lockTransaction;
    });
  }
}
exports.default = BitcoinWallet;
// # sourceMappingURL=BitcoinWallet.js.map
