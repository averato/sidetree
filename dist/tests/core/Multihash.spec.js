'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const Encoder_1 = require('../../lib/core/versions/latest/Encoder');
const ErrorCode_1 = require('../../lib/core/versions/latest/ErrorCode');
const JasmineSidetreeErrorValidator_1 = require('../JasmineSidetreeErrorValidator');
const JsonCanonicalizer_1 = require('../../lib/core/versions/latest/util/JsonCanonicalizer');
const Multihash_1 = require('../../lib/core/versions/latest/Multihash');
describe('Multihash', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  describe('isValidHash()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should return false if content is undefined', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const result = Multihash_1.default.isValidHash(undefined, 'anyCommitment');
      expect(result).toBeFalsy();
    }));
    it('should return false if encountered an unexpected error.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const multihashHashSpy = spyOn(Multihash_1.default, 'verifyEncodedMultihashForContent').and.throwError('Simulated error message.');
      const result = Multihash_1.default.isValidHash('revealValue', 'commitmentHash');
      expect(multihashHashSpy).toHaveBeenCalled();
      expect(result).toBeFalsy();
    }));
  }));
  describe('hash()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should throws if given an unsupported hash algorithm.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const unsupportedHashAlgorithm = 19;
      JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => Multihash_1.default.hash(Buffer.from('any content'), unsupportedHashAlgorithm), ErrorCode_1.default.MultihashUnsupportedHashAlgorithm);
    }));
  }));
  describe('canonicalizeAndVerifyDoubleHash()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should return false if `undefined` is given as content.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const validHash = Multihash_1.default.canonicalizeAndVerifyDoubleHash(undefined, 'unusedMultihashValue');
      expect(validHash).toBeFalsy();
    }));
    it('should return false if unexpected error is caught.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      spyOn(JsonCanonicalizer_1.default, 'canonicalizeAsBuffer').and.throwError('any error');
      const validHash = Multihash_1.default.canonicalizeAndVerifyDoubleHash({ unused: 'unused' }, 'unusedMultihashValue');
      expect(validHash).toBeFalsy();
    }));
  }));
  describe('verify()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should return false if unexpected error is caught.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      spyOn(Encoder_1.default, 'decodeAsBuffer').and.throwError('any error');
      const validHash = Multihash_1.default.verifyEncodedMultihashForContent(Buffer.from('anyValue'), 'unusedMultihashValue');
      expect(validHash).toBeFalsy();
    }));
    it('should return false if given encoded multihash is not using the canonical encoding.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const anyContent = Buffer.from('any content');
      const defaultContentEncodedMultihash = 'EiDDidVHVekuMIYV3HI5nfp8KP6s3_W44Pd-MO5b-XK5iQ';
      const modifiedContentEncodedMultihash = 'EiDDidVHVekuMIYV3HI5nfp8KP6s3_W44Pd-MO5b-XK5iR';
      expect(Encoder_1.default.decodeAsBuffer(defaultContentEncodedMultihash)).toEqual(Encoder_1.default.decodeAsBuffer(modifiedContentEncodedMultihash));
      const validHashCheckResult = Multihash_1.default.verifyEncodedMultihashForContent(anyContent, defaultContentEncodedMultihash);
      const invalidHashCheckResult = Multihash_1.default.verifyEncodedMultihashForContent(anyContent, modifiedContentEncodedMultihash);
      expect(validHashCheckResult).toBeTruthy();
      expect(invalidHashCheckResult).toBeFalsy();
    }));
  }));
  describe('verifyDoubleHash()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should return false if unexpected error is caught.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      spyOn(Encoder_1.default, 'decodeAsBuffer').and.throwError('any error');
      const validHash = Multihash_1.default.verifyDoubleHash(Buffer.from('anyValue'), 'unusedMultihashValue');
      expect(validHash).toBeFalsy();
    }));
  }));
}));
// # sourceMappingURL=Multihash.spec.js.map
