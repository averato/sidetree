'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
class MockBatchWriter {
  constructor () {
    this.invocationCount = 0;
  }

  write () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      this.invocationCount++;
      return 0;
    });
  }
}
exports.default = MockBatchWriter;
// # sourceMappingURL=MockBatchWriter.js.map
