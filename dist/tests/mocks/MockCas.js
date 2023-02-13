'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const Encoder_1 = require('../../lib/core/versions/latest/Encoder');
const FetchResultCode_1 = require('../../lib/common/enums/FetchResultCode');
const Multihash_1 = require('../../lib/core/versions/latest/Multihash');
class MockCas {
  constructor (mockSecondsTakenForEachCasFetch) {
    this.storage = new Map();
    this.mockSecondsTakenForEachCasFetch = 0;
    if (mockSecondsTakenForEachCasFetch !== undefined) {
      this.mockSecondsTakenForEachCasFetch = mockSecondsTakenForEachCasFetch;
    }
  }

  static getAddress (content) {
    const hash = Multihash_1.default.hash(content, 18);
    const encodedHash = Encoder_1.default.encode(hash);
    return encodedHash;
  }

  write (content) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const encodedHash = MockCas.getAddress(content);
      this.storage.set(encodedHash, content);
      return encodedHash;
    });
  }

  read (address, _maxSizeInBytes) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      yield new Promise(resolve => setTimeout(resolve, this.mockSecondsTakenForEachCasFetch * 1000));
      const content = this.storage.get(address);
      if (content === undefined) {
        return {
          code: FetchResultCode_1.default.NotFound
        };
      }
      return {
        code: FetchResultCode_1.default.Success,
        content
      };
    });
  }
}
exports.default = MockCas;
// # sourceMappingURL=MockCas.js.map
