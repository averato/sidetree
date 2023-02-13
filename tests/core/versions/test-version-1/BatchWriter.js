'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
class BatchWriter {
  constructor (operationQueue, blockchain, cas, versionMetadataFetcher) {
    this.operationQueue = operationQueue;
    this.blockchain = blockchain;
    this.cas = cas;
    this.versionMetadataFetcher = versionMetadataFetcher;
    console.info(this.operationQueue, this.blockchain, this.cas, this.versionMetadataFetcher);
  }

  write () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      throw new Error('BatchWriter: Not implemented. Version: TestVersion1');
    });
  }
}
exports.default = BatchWriter;
// # sourceMappingURL=BatchWriter.js.map
