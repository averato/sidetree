"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const EventCode_1 = require("../core/EventCode");
const EventEmitter_1 = require("../common/EventEmitter");
const Logger_1 = require("../common/Logger");
class BlockchainClock {
    constructor(blockchain, serviceStateStore, enableRealBlockchainTimePull) {
        this.blockchain = blockchain;
        this.serviceStateStore = serviceStateStore;
        this.enableRealBlockchainTimePull = enableRealBlockchainTimePull;
        this.continuePulling = true;
        this.blockchainTimePullIntervalInSeconds = 60;
    }
    getTime() {
        return this.cachedApproximateTime;
    }
    startPeriodicPullLatestBlockchainTime() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const serviceState = yield this.serviceStateStore.get();
                if (this.enableRealBlockchainTimePull) {
                    yield this.pullRealBlockchainTime(serviceState);
                }
                this.cachedApproximateTime = serviceState.approximateTime;
                Logger_1.default.info(`Core cachedApproximateTime updated to: ${serviceState.approximateTime}`);
            }
            catch (e) {
                Logger_1.default.error(`Error occurred while updating BitcoinClock: ${e}`);
            }
            if (this.continuePulling) {
                setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function* () { return this.startPeriodicPullLatestBlockchainTime(); }), this.blockchainTimePullIntervalInSeconds * 1000);
            }
        });
    }
    pullRealBlockchainTime(serviceState) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const latestBlockchainTime = yield this.blockchain.getLatestTime();
                if (serviceState.approximateTime !== latestBlockchainTime.time) {
                    serviceState.approximateTime = latestBlockchainTime.time;
                    yield this.serviceStateStore.put(serviceState);
                    EventEmitter_1.default.emit(EventCode_1.default.SidetreeBlockchainTimeChanged, { time: serviceState.approximateTime });
                }
            }
            catch (e) {
                Logger_1.default.error(`Error occurred while updating blockchain time, investigate and fix: ${e}`);
            }
        });
    }
}
exports.default = BlockchainClock;
//# sourceMappingURL=BlockchainClock.js.map