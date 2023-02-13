'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const IpfsErrorCode_1 = require('../../lib/ipfs/IpfsErrorCode');
const JasmineSidetreeErrorValidator_1 = require('../JasmineSidetreeErrorValidator');
const Timeout_1 = require('../../lib/ipfs/Util/Timeout');
describe('Timeout', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  describe('timeout()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should timeout if given task took too long.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const longRunningPromise = new Promise((resolve) => {
        setTimeout(() => { resolve(1); }, 10);
      });
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => Timeout_1.default.timeout(longRunningPromise, 1), IpfsErrorCode_1.default.TimeoutPromiseTimedOut);
      done();
    }));
    it('should return error thrown by the task.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const error = new Error('some bad error');
      const aPromiseThatThrowsError = new Promise(() => {
        throw error;
      });
      yield expectAsync(Timeout_1.default.timeout(aPromiseThatThrowsError, 1000)).toBeRejected(error);
      done();
    }));
  }));
}));
// # sourceMappingURL=Timeout.spec.js.map
