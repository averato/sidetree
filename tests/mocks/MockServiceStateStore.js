'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
class MockServiceStateStore {
  constructor () {
    this.serviceState = {};
  }

  put (serviceState) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      this.serviceState = serviceState;
    });
  }

  get () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      return this.serviceState;
    });
  }
}
exports.default = MockServiceStateStore;
// # sourceMappingURL=MockServiceStateStore.js.map
