'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const IpfsErrorCode_1 = require('../IpfsErrorCode');
const SidetreeError_1 = require('../../common/SidetreeError');
class Timeout {
  static timeout (task, timeoutInMilliseconds) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const timeoutPromise = new Promise((_resolve, reject) => {
        setTimeout(() => { reject(new SidetreeError_1.default(IpfsErrorCode_1.default.TimeoutPromiseTimedOut, `Promise timed out after ${timeoutInMilliseconds} milliseconds.`)); }, timeoutInMilliseconds);
      });
      const content = yield Promise.race([task, timeoutPromise]);
      return content;
    });
  }
}
exports.default = Timeout;
// # sourceMappingURL=Timeout.js.map
