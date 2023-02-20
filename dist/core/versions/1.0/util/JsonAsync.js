'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const yieldableJson = require('yieldable-json');
class JsonAsync {
  static parse (jsonData) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const jsonParsePromise = new Promise((resolve, reject) => {
        yieldableJson.parseAsync(jsonData, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
      const result = yield jsonParsePromise;
      return result;
    });
  }
}
exports.default = JsonAsync;
// # sourceMappingURL=JsonAsync.js.map
