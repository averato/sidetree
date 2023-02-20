'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const ErrorCode_1 = require('./ErrorCode');
const JsonCanonicalizer_1 = require('./util/JsonCanonicalizer');
const Logger_1 = require('../../../common/Logger');
const Operation_1 = require('./Operation');
const ProtocolParameters_1 = require('./ProtocolParameters');
const SidetreeError_1 = require('../../../common/SidetreeError');
class Delta {
  static validateDeltaIsDefined (delta) {
    if (delta === undefined || delta === null) {
      throw new SidetreeError_1.default(ErrorCode_1.default.DeltaIsNullOrUndefined, `Delta is ${delta}`);
    }
  }

  static validateDelta (delta) {
    Delta.validateDeltaIsDefined(delta);
    const size = Buffer.byteLength(JsonCanonicalizer_1.default.canonicalizeAsBuffer(delta));
    if (size > ProtocolParameters_1.default.maxDeltaSizeInBytes) {
      const errorMessage = `${size} bytes of 'delta' exceeded limit of ${ProtocolParameters_1.default.maxDeltaSizeInBytes} bytes.`;
      Logger_1.default.info(errorMessage);
      throw new SidetreeError_1.default(ErrorCode_1.default.DeltaExceedsMaximumSize, errorMessage);
    }
    Operation_1.default.validateDelta(delta);
  }
}
exports.default = Delta;
// # sourceMappingURL=Delta.js.map
