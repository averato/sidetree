"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const BlockchainClock_1 = require("../../lib/core/BlockchainClock");
const MockBlockchain_1 = require("../mocks/MockBlockchain");
const MockServiceStateStore_1 = require("../mocks/MockServiceStateStore");
describe('BlockchainClock', () => {
    let blockchainClock;
    beforeEach(() => {
        blockchainClock = new BlockchainClock_1.default(new MockBlockchain_1.default(), new MockServiceStateStore_1.default(), true);
    });
    describe('getTime', () => {
        it('should return cached time', () => {
            expect(blockchainClock.getTime()).toEqual(undefined);
            blockchainClock['cachedApproximateTime'] = 123;
            expect(blockchainClock.getTime()).toEqual(123);
        });
    });
    describe('startPeriodicPullLatestBlockchainTime', () => {
        it('should pull the blockchain time periodically', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            blockchainClock['blockchainTimePullIntervalInSeconds'] = 0.01;
            const pullIntervalSpy = spyOn(blockchainClock, 'startPeriodicPullLatestBlockchainTime').and.callThrough();
            spyOn(blockchainClock['blockchain'], 'getLatestTime').and.returnValue(Promise.resolve({ time: 123, hash: 'someHash' }));
            jasmine.clock().install();
            jasmine.clock().mockDate();
            expect(blockchainClock['cachedApproximateTime']).toEqual(undefined);
            yield blockchainClock['startPeriodicPullLatestBlockchainTime']();
            expect(pullIntervalSpy).toHaveBeenCalledTimes(1);
            expect(yield blockchainClock['serviceStateStore'].get()).toEqual({ approximateTime: 123 });
            expect(blockchainClock['cachedApproximateTime']).toEqual(123);
            jasmine.clock().tick(11);
            expect(pullIntervalSpy).toHaveBeenCalledTimes(2);
            blockchainClock['continuePulling'] = false;
            jasmine.clock().uninstall();
        }));
        it('should pull the blockchain time periodically when error is thrown', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            blockchainClock['blockchainTimePullIntervalInSeconds'] = 0.01;
            const pullIntervalSpy = spyOn(blockchainClock, 'startPeriodicPullLatestBlockchainTime').and.callThrough();
            spyOn(blockchainClock['blockchain'], 'getLatestTime').and.throwError('Fake test error');
            spyOn(blockchainClock['serviceStateStore'], 'get').and.throwError('Fake test Error');
            jasmine.clock().install();
            jasmine.clock().mockDate();
            expect(blockchainClock['cachedApproximateTime']).toEqual(undefined);
            yield blockchainClock['startPeriodicPullLatestBlockchainTime']();
            expect(pullIntervalSpy).toHaveBeenCalledTimes(1);
            expect(blockchainClock['cachedApproximateTime']).toEqual(undefined);
            jasmine.clock().tick(11);
            expect(pullIntervalSpy).toHaveBeenCalledTimes(2);
            blockchainClock['continuePulling'] = false;
            jasmine.clock().uninstall();
        }));
        it('should pull the blockchain time periodically from db when bitcoin client error', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            blockchainClock['blockchainTimePullIntervalInSeconds'] = 0.01;
            const pullIntervalSpy = spyOn(blockchainClock, 'startPeriodicPullLatestBlockchainTime').and.callThrough();
            spyOn(blockchainClock['blockchain'], 'getLatestTime').and.throwError('Fake test error');
            spyOn(blockchainClock['serviceStateStore'], 'get').and.returnValue(Promise.resolve({ approximateTime: 123 }));
            jasmine.clock().install();
            jasmine.clock().mockDate();
            expect(blockchainClock['cachedApproximateTime']).toEqual(undefined);
            yield blockchainClock['startPeriodicPullLatestBlockchainTime']();
            expect(pullIntervalSpy).toHaveBeenCalledTimes(1);
            expect(blockchainClock['cachedApproximateTime']).toEqual(123);
            jasmine.clock().tick(11);
            expect(pullIntervalSpy).toHaveBeenCalledTimes(2);
            blockchainClock['continuePulling'] = false;
            jasmine.clock().uninstall();
        }));
        it('should only pull from db if enableRealBlockchainTime is false', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            blockchainClock['blockchainTimePullIntervalInSeconds'] = 0.01;
            blockchainClock['enableRealBlockchainTimePull'] = false;
            const pullIntervalSpy = spyOn(blockchainClock, 'startPeriodicPullLatestBlockchainTime').and.callThrough();
            const pullRealBlockchainTimeSpy = spyOn(blockchainClock, 'pullRealBlockchainTime');
            jasmine.clock().install();
            jasmine.clock().mockDate();
            expect(blockchainClock['cachedApproximateTime']).toEqual(undefined);
            yield blockchainClock['startPeriodicPullLatestBlockchainTime']();
            expect(pullIntervalSpy).toHaveBeenCalledTimes(1);
            expect(pullRealBlockchainTimeSpy).not.toHaveBeenCalled();
            expect(blockchainClock['cachedApproximateTime']).toEqual(undefined);
            jasmine.clock().tick(11);
            expect(pullIntervalSpy).toHaveBeenCalledTimes(2);
            blockchainClock['continuePulling'] = false;
            jasmine.clock().uninstall();
        }));
    });
});
//# sourceMappingURL=BlockchainClock.spec.js.map