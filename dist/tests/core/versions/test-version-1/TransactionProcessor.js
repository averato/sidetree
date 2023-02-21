'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
class TransactionProcessor {
  constructor (downloadManager, operationStore, blockchain, versionMetadataFetcher) {
    this.downloadManager = downloadManager;
    this.operationStore = operationStore;
    this.blockchain = blockchain;
    this.versionMetadataFetcher = versionMetadataFetcher;
    console.info(this.downloadManager, this.operationStore, this.blockchain, this.versionMetadataFetcher);
  }

  processTransaction (transaction) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      throw new Error(`TransactionProcessor: Not implemented. Version: TestVersion1. Inputs: ${transaction}`);
    });
  }
}
exports.default = TransactionProcessor;
// # sourceMappingURL=TransactionProcessor.js.map
