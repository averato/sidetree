'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const ErrorCode_1 = require('../../../lib/core/versions/latest/ErrorCode');
const JasmineSidetreeErrorValidator_1 = require('../../JasmineSidetreeErrorValidator');
const Jwk_1 = require('../../../lib/core/versions/latest/util/Jwk');
const SidetreeError_1 = require('../../../lib/common/SidetreeError');
describe('Jwk', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  describe('validateJwkEs256k()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should throw error if `undefined` is passed.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      expect(() => { Jwk_1.default.validateJwkEs256k(undefined); }).toThrow(new SidetreeError_1.default(ErrorCode_1.default.JwkEs256kUndefined));
    }));
    it('should throw error if un unknown property is included in the JWK.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const publicKeyJwk = {
        unknownProperty: 'any value',
        kty: 'EC',
        crv: 'secp256k1',
        x: '5s3-bKjD1Eu_3NJu8pk7qIdOPl1GBzU_V8aR3xiacoM',
        y: 'v0-Q5H3vcfAfQ4zsebJQvMrIg3pcsaJzRvuIYZ3_UOY'
      };
      expect(() => { Jwk_1.default.validateJwkEs256k(publicKeyJwk); }).toThrow(new SidetreeError_1.default(ErrorCode_1.default.JwkEs256kHasUnknownProperty));
    }));
    it('should throw error if JWK has the wrong `kty` value.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const publicKeyJwk = {
        kty: 'WRONG_TYPE',
        crv: 'secp256k1',
        x: '5s3-bKjD1Eu_3NJu8pk7qIdOPl1GBzU_V8aR3xiacoM',
        y: 'v0-Q5H3vcfAfQ4zsebJQvMrIg3pcsaJzRvuIYZ3_UOY'
      };
      expect(() => { Jwk_1.default.validateJwkEs256k(publicKeyJwk); }).toThrow(new SidetreeError_1.default(ErrorCode_1.default.JwkEs256kMissingOrInvalidKty));
    }));
    it('should throw error if JWK has the wrong `crv` value.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const publicKeyJwk = {
        kty: 'EC',
        crv: 'WRONG_CURVE',
        x: '5s3-bKjD1Eu_3NJu8pk7qIdOPl1GBzU_V8aR3xiacoM',
        y: 'v0-Q5H3vcfAfQ4zsebJQvMrIg3pcsaJzRvuIYZ3_UOY'
      };
      expect(() => { Jwk_1.default.validateJwkEs256k(publicKeyJwk); }).toThrow(new SidetreeError_1.default(ErrorCode_1.default.JwkEs256kMissingOrInvalidCrv));
    }));
    it('should throw error if JWK has the wrong `x` type.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const publicKeyJwk = {
        kty: 'EC',
        crv: 'secp256k1',
        x: 123,
        y: 'v0-Q5H3vcfAfQ4zsebJQvMrIg3pcsaJzRvuIYZ3_UOY'
      };
      expect(() => { Jwk_1.default.validateJwkEs256k(publicKeyJwk); }).toThrow(new SidetreeError_1.default(ErrorCode_1.default.JwkEs256kMissingOrInvalidTypeX));
    }));
    it('should throw error if JWK has the wrong `y` type.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const publicKeyJwk = {
        kty: 'EC',
        crv: 'secp256k1',
        x: '5s3-bKjD1Eu_3NJu8pk7qIdOPl1GBzU_V8aR3xiacoM',
        y: 123
      };
      expect(() => { Jwk_1.default.validateJwkEs256k(publicKeyJwk); }).toThrow(new SidetreeError_1.default(ErrorCode_1.default.JwkEs256kMissingOrInvalidTypeY));
    }));
    it('should throw error if given key contains invalid x length.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const publicKeyJwk = {
        kty: 'EC',
        crv: 'secp256k1',
        x: 'incorrectLength',
        y: 'v0-Q5H3vcfAfQ4zsebJQvMrIg3pcsaJzRvuIYZ3_UOY'
      };
      JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => Jwk_1.default.validateJwkEs256k(publicKeyJwk), ErrorCode_1.default.JwkEs256kHasIncorrectLengthOfX);
    }));
    it('should throw error if given key contains invalid y length.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const publicKeyJwk = {
        kty: 'EC',
        crv: 'secp256k1',
        x: '5s3-bKjD1Eu_3NJu8pk7qIdOPl1GBzU_V8aR3xiacoM',
        y: 'incorrectLength'
      };
      JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => Jwk_1.default.validateJwkEs256k(publicKeyJwk), ErrorCode_1.default.JwkEs256kHasIncorrectLengthOfY);
    }));
  }));
}));
// # sourceMappingURL=Jwk.spec.js.map
