'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const Monitor_1 = require('../../lib/bitcoin/Monitor');
describe('BitcoinFileReader', () => {
  let monitor;
  beforeAll(() => {
    const mockBitcoinClient = { getBalanceInSatoshis: () => { } };
    monitor = new Monitor_1.default(mockBitcoinClient);
  });
  describe('getWalletBalance', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should get wallet balance', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const mockBalance = 123;
      spyOn(monitor['bitcoinClient'], 'getBalanceInSatoshis').and.returnValue(Promise.resolve(mockBalance));
      const balance = yield monitor.getWalletBalance();
      expect(balance).toEqual({ walletBalanceInBtc: 0.00000123 });
    }));
  }));
});
// # sourceMappingURL=Monitor.spec.js.map
