"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
class Monitor {
    constructor(bitcoinClient) {
        this.bitcoinClient = bitcoinClient;
    }
    getWalletBalance() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const walletBalanceInSatoshis = yield this.bitcoinClient.getBalanceInSatoshis();
            const walletBalanceInBtc = walletBalanceInSatoshis / 100000000;
            return { walletBalanceInBtc };
        });
    }
}
exports.default = Monitor;
//# sourceMappingURL=Monitor.js.map