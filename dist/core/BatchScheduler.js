'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const timeSpan = require('time-span');
const ErrorCode_1 = require('./ErrorCode');
const EventCode_1 = require('./EventCode');
const EventEmitter_1 = require('../common/EventEmitter');
const Logger_1 = require('../common/Logger');
const SidetreeError_1 = require('../common/SidetreeError');
class BatchScheduler {
  constructor (versionManager, blockchain, batchingIntervalInSeconds) {
    this.versionManager = versionManager;
    this.blockchain = blockchain;
    this.batchingIntervalInSeconds = batchingIntervalInSeconds;
    this.continuePeriodicBatchWriting = false;
  }

  startPeriodicBatchWriting () {
    this.continuePeriodicBatchWriting = true;
    setImmediate(() => tslib_1.__awaiter(this, void 0, void 0, function * () { return this.writeOperationBatch(); }));
  }

  stopPeriodicBatchWriting () {
    Logger_1.default.info(`Stopped periodic batch writing.`);
    this.continuePeriodicBatchWriting = false;
  }

  writeOperationBatch () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const endTimer = timeSpan();
      try {
        Logger_1.default.info('Start operation batch writing...');
        const currentTime = (yield this.blockchain.getLatestTime()).time;
        const batchWriter = this.versionManager.getBatchWriter(currentTime);
        const batchSize = yield batchWriter.write();
        EventEmitter_1.default.emit(EventCode_1.default.SidetreeBatchWriterLoopSuccess, { batchSize });
      } catch (error) {
        const loopFailureEventData = { code: ErrorCode_1.default.BatchSchedulerWriteUnexpectedError };
        if (error instanceof SidetreeError_1.default && error.code !== ErrorCode_1.default.BlockchainWriteUnexpectedError) {
          loopFailureEventData.code = error.code;
        } else {
          Logger_1.default.error('Unexpected and unhandled error during batch writing, investigate and fix:');
          Logger_1.default.error(error);
        }
        EventEmitter_1.default.emit(EventCode_1.default.SidetreeBatchWriterLoopFailure, loopFailureEventData);
      } finally {
        Logger_1.default.info(`End batch writing. Duration: ${endTimer.rounded()} ms.`);
        if (this.continuePeriodicBatchWriting) {
          Logger_1.default.info(`Waiting for ${this.batchingIntervalInSeconds} seconds before writing another batch.`);
          setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function * () { return this.writeOperationBatch(); }), this.batchingIntervalInSeconds * 1000);
        }
      }
    });
  }
}
exports.default = BatchScheduler;
// # sourceMappingURL=BatchScheduler.js.map
