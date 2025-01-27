'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const crypto = require('crypto');
const Did_1 = require('../../lib/core/versions/latest/Did');
const Encoder_1 = require('../../lib/core/versions/latest/Encoder');
const ErrorCode_1 = require('../../lib/core/versions/latest/ErrorCode');
const JasmineSidetreeErrorValidator_1 = require('../JasmineSidetreeErrorValidator');
const JsonCanonicalizer_1 = require('../../lib/core/versions/latest/util/JsonCanonicalizer');
const OperationGenerator_1 = require('../generators/OperationGenerator');
const SidetreeError_1 = require('../../lib/common/SidetreeError');
describe('DID', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  describe('constructCreateOperationFromEncodedJCS', () => {
    it('should throw sidetree error if initial state is not an json', () => {
      const testInitialState = Encoder_1.default.encode('notJson');
      try {
        Did_1.default['constructCreateOperationFromEncodedJcs'](testInitialState);
        fail('expect to throw sidetree error but did not');
      } catch (e) {
        expect(e).toEqual(new SidetreeError_1.default(ErrorCode_1.default.DidInitialStateJcsIsNotJson, 'Long form initial state should be encoded jcs.'));
      }
    });
    it('should throw sidetree error if initial state is not jcs', () => {
      const testInitialState = Encoder_1.default.encode(JSON.stringify({ z: 1, a: 2, b: 1 }));
      try {
        Did_1.default['constructCreateOperationFromEncodedJcs'](testInitialState);
        fail('expect to throw sidetree error but did not');
      } catch (e) {
        expect(e).toEqual(new SidetreeError_1.default(ErrorCode_1.default.DidInitialStateJcsIsNotJcs, 'Initial state object and JCS string mismatch.'));
      }
    });
    it('should throw sidetree error if delta exceeds size limit', () => {
      const largeData = crypto.randomBytes(2000).toString('hex');
      const largeDelta = { data: largeData };
      const testInitialState = Encoder_1.default.encode(JsonCanonicalizer_1.default.canonicalizeAsBuffer({ suffixData: 'some data', delta: largeDelta }));
      JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => {
        Did_1.default['constructCreateOperationFromEncodedJcs'](testInitialState);
      }, ErrorCode_1.default.DeltaExceedsMaximumSize);
    });
  });
  describe('create()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should create a short-form DID successfully.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const expectedDidMethodName = 'sidetree';
      const uniqueSuffix = 'abcdefg';
      const didString = `did:${expectedDidMethodName}:${uniqueSuffix}`;
      const did = yield Did_1.default.create(didString, expectedDidMethodName);
      expect(did.didMethodName).toEqual(expectedDidMethodName);
      expect(did.createOperation).toBeUndefined();
      expect(did.isShortForm).toBeTruthy();
      expect(did.shortForm).toEqual(didString);
      expect(did.uniqueSuffix).toEqual(uniqueSuffix);
    }));
    it('should create a long-form DID with suffix data and delta successfully.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const generatedLongFormDidData = yield OperationGenerator_1.default.generateLongFormDid();
      const didMethodName = 'sidetree';
      const did = yield Did_1.default.create(generatedLongFormDidData.longFormDid, didMethodName);
      expect(did.isShortForm).toBeFalsy();
      expect(did.didMethodName).toEqual(didMethodName);
      expect(did.shortForm).toEqual(generatedLongFormDidData.shortFormDid);
      expect(did.uniqueSuffix).toEqual(generatedLongFormDidData.didUniqueSuffix);
    }));
    it('should create a testnet long-form DID with suffix data and delta successfully.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const generatedLongFormDidData = yield OperationGenerator_1.default.generateLongFormDid(undefined, undefined, 'testnet');
      const didMethodName = 'sidetree:testnet';
      const did = yield Did_1.default.create(generatedLongFormDidData.longFormDid, didMethodName);
      expect(did.isShortForm).toBeFalsy();
      expect(did.didMethodName).toEqual(didMethodName);
      expect(did.shortForm).toEqual(generatedLongFormDidData.shortFormDid);
      expect(did.uniqueSuffix).toEqual(generatedLongFormDidData.didUniqueSuffix);
    }));
    it('should throw if DID given does not match the expected DID method name.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () { return Did_1.default.create('did:sidetree:EiAgE-q5cRcn4JHh8ETJGKqaJv1z2OgjmN3N-APx0aAvHg', 'sidetree2'); }), ErrorCode_1.default.DidIncorrectPrefix);
    }));
    it('should throw if DID given does not contain unique suffix.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () { return Did_1.default.create('did:sidetree:', 'sidetree'); }), ErrorCode_1.default.DidNoUniqueSuffix);
    }));
    it('should throw if encoded DID document in long-form DID given results in a mismatching short-form DID.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      let longFormDid = (yield OperationGenerator_1.default.generateLongFormDid()).longFormDid;
      const longFormDidParts = longFormDid.split(':');
      longFormDidParts[2] = 'EiA_MismatchingDID_AAAAAAAAAAAAAAAAAAAAAAAAAAA';
      longFormDid = longFormDidParts.join(':');
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () { return Did_1.default.create(longFormDid, 'sidetree'); }), ErrorCode_1.default.DidUniqueSuffixFromInitialStateMismatch);
    }));
  }));
}));
// # sourceMappingURL=Did.spec.js.map
