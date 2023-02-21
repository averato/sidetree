'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const Encoder_1 = require('../../lib/core/versions/latest/Encoder');
const ErrorCode_1 = require('../../lib/core/versions/latest/ErrorCode');
const JasmineSidetreeErrorValidator_1 = require('../JasmineSidetreeErrorValidator');
describe('Encoder', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  describe('decodeAsBuffer()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should throw if input is not a string.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const input = undefined;
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () { return Encoder_1.default.decodeAsBuffer(input); }), ErrorCode_1.default.EncoderValidateBase64UrlStringInputNotString);
      done();
    }));
    it('should throw if input string is not Base64URL string.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const input = 'inputStringContainingNonBase64UrlCharsLike#';
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () { return Encoder_1.default.decodeAsBuffer(input); }), ErrorCode_1.default.EncoderValidateBase64UrlStringInputNotBase64UrlString);
      done();
    }));
  }));
}));
// # sourceMappingURL=Encoder.spec.js.map
