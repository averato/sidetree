"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const retry = require("async-retry");
const BatchScheduler_1 = require("../../lib/core/BatchScheduler");
const EventCode_1 = require("../../lib/core/EventCode");
const EventEmitter_1 = require("../../lib/common/EventEmitter");
const MockBatchWriter_1 = require("../mocks/MockBatchWriter");
const MockBlockchain_1 = require("../mocks/MockBlockchain");
const MockVersionManager_1 = require("../mocks/MockVersionManager");
const SidetreeError_1 = require("../../lib/common/SidetreeError");
describe('BatchScheduler', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    it('should periodically invoke batch writer.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const blockchain = new MockBlockchain_1.default();
        const batchWriter = new MockBatchWriter_1.default();
        const versionManager = new MockVersionManager_1.default();
        spyOn(versionManager, 'getBatchWriter').and.returnValue(batchWriter);
        const batchScheduler = new BatchScheduler_1.default(versionManager, blockchain, 1);
        batchScheduler.startPeriodicBatchWriting();
        yield retry((_bail) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            if (batchWriter.invocationCount >= 2) {
                return;
            }
            throw new Error('Batch writer not invoked.');
        }), {});
        batchScheduler.stopPeriodicBatchWriting();
        expect(batchWriter.invocationCount).toBeGreaterThanOrEqual(2);
    }));
    it('should emit failure event with specific code if known SidetreeError is thrown.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const blockchain = new MockBlockchain_1.default();
        const dummyErrorCode = 'any error code';
        const versionManager = new MockVersionManager_1.default();
        spyOn(versionManager, 'getBatchWriter').and.callFake(() => { throw new SidetreeError_1.default(dummyErrorCode); });
        const eventEmitterEmitSpy = spyOn(EventEmitter_1.default, 'emit');
        const batchScheduler = new BatchScheduler_1.default(versionManager, blockchain, 1);
        yield batchScheduler.writeOperationBatch();
        expect(eventEmitterEmitSpy).toHaveBeenCalledWith(EventCode_1.default.SidetreeBatchWriterLoopFailure, { code: dummyErrorCode });
    }));
}));
//# sourceMappingURL=BatchScheduler.spec.js.map