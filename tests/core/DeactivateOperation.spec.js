'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const DeactivateOperation_1 = require('../../lib/core/versions/latest/DeactivateOperation');
const Encoder_1 = require('../../lib/core/versions/latest/Encoder');
const ErrorCode_1 = require('../../lib/core/versions/latest/ErrorCode');
const JasmineSidetreeErrorValidator_1 = require('../JasmineSidetreeErrorValidator');
const Jwk_1 = require('../../lib/core/versions/latest/util/Jwk');
const OperationGenerator_1 = require('../generators/OperationGenerator');
const OperationType_1 = require('../../lib/core/enums/OperationType');
const SidetreeError_1 = require('../../lib/common/SidetreeError');
describe('DeactivateOperation', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  describe('parse()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should parse as expected', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const deactivateOperationRequest = yield OperationGenerator_1.default.createDeactivateOperationRequest('EiDyOQbbZAa3aiRzeCkV7LOx3SERjjH93EXoIM3UoN4oWg', recoveryPrivateKey);
      const operationBuffer = Buffer.from(JSON.stringify(deactivateOperationRequest));
      const result = yield DeactivateOperation_1.default.parse(operationBuffer);
      expect(result).toBeDefined();
      done();
    }));
    it('should throw if operation contains unknown property', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const deactivateOperationRequest = yield OperationGenerator_1.default.createDeactivateOperationRequest('EiDyOQbbZAa3aiRzeCkV7LOx3SERjjH93EXoIM3UoN4oWg', recoveryPrivateKey);
      deactivateOperationRequest.unknownProperty = 'unknown property value';
      const operationBuffer = Buffer.from(JSON.stringify(deactivateOperationRequest));
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => DeactivateOperation_1.default.parse(operationBuffer), ErrorCode_1.default.InputValidatorInputContainsNowAllowedProperty, 'deactivate request');
    }));
    it('should throw if operation type is incorrect.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const deactivateOperationRequest = yield OperationGenerator_1.default.createDeactivateOperationRequest('EiDyOQbbZAa3aiRzeCkV7LOx3SERjjH93EXoIM3UoN4oWg', recoveryPrivateKey);
      deactivateOperationRequest.type = OperationType_1.default.Create;
      const operationBuffer = Buffer.from(JSON.stringify(deactivateOperationRequest));
      yield expectAsync(DeactivateOperation_1.default.parse(operationBuffer)).toBeRejectedWith(new SidetreeError_1.default(ErrorCode_1.default.DeactivateOperationTypeIncorrect));
      done();
    }));
    it('should throw if didUniqueSuffix is not string.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const deactivateOperationRequest = yield OperationGenerator_1.default.createDeactivateOperationRequest('unused-DID-unique-suffix', recoveryPrivateKey);
      deactivateOperationRequest.didSuffix = 123;
      const operationBuffer = Buffer.from(JSON.stringify(deactivateOperationRequest));
      yield expectAsync(DeactivateOperation_1.default
        .parse(operationBuffer)).toBeRejectedWith(new SidetreeError_1.default(`The deactivate request didSuffix must be a string but is of number type.`));
      done();
    }));
    it('should throw if didUniqueSuffix is undefined.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const deactivateOperationRequest = yield OperationGenerator_1.default.createDeactivateOperationRequest('unused-DID-unique-suffix', recoveryPrivateKey);
      deactivateOperationRequest.didSuffix = undefined;
      const operationBuffer = Buffer.from(JSON.stringify(deactivateOperationRequest));
      yield expectAsync(DeactivateOperation_1.default
        .parse(operationBuffer)).toBeRejectedWith(new SidetreeError_1.default(`The deactivate request didSuffix must be a string but is of undefined type.`));
      done();
    }));
    it('should throw if didUniqueSuffix is not encoded multihash.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const deactivateOperationRequest = yield OperationGenerator_1.default.createDeactivateOperationRequest('unused-DID-unique-suffix', recoveryPrivateKey);
      deactivateOperationRequest.didSuffix = 'thisIsNotMultihash';
      const operationBuffer = Buffer.from(JSON.stringify(deactivateOperationRequest));
      yield expectAsync(DeactivateOperation_1.default
        .parse(operationBuffer)).toBeRejectedWith(new SidetreeError_1.default(`Given deactivate request didSuffix string 'thisIsNotMultihash' is not a multihash.`));
      done();
    }));
  }));
  describe('parseObject()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should throw if hash of `recoveryKey` does not match the revealValue.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const didSuffix = OperationGenerator_1.default.generateRandomHash();
      const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const deactivateRequest = yield OperationGenerator_1.default.createDeactivateOperationRequest(didSuffix, recoveryPrivateKey);
      deactivateRequest.revealValue = OperationGenerator_1.default.generateRandomHash();
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => DeactivateOperation_1.default.parseObject(deactivateRequest, Buffer.from('unused')), ErrorCode_1.default.CanonicalizedObjectHashMismatch, 'deactivate request');
    }));
    it('should throw if revealValue is not a multihash.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const didSuffix = OperationGenerator_1.default.generateRandomHash();
      const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const deactivateRequest = yield OperationGenerator_1.default.createDeactivateOperationRequest(didSuffix, recoveryPrivateKey);
      deactivateRequest.revealValue = 'not-a-multihash';
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => DeactivateOperation_1.default.parseObject(deactivateRequest, Buffer.from('unused')), ErrorCode_1.default.MultihashStringNotAMultihash, 'deactivate request');
    }));
    it('should throw if revealValue is an unsupported multihash.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const didSuffix = OperationGenerator_1.default.generateRandomHash();
      const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const deactivateRequest = yield OperationGenerator_1.default.createDeactivateOperationRequest(didSuffix, recoveryPrivateKey);
      deactivateRequest.revealValue = 'ARSIZ8iLVuC_uCz_rxWma8jRB9Z1Sg';
      yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => DeactivateOperation_1.default.parseObject(deactivateRequest, Buffer.from('unused')), ErrorCode_1.default.MultihashNotSupported, 'deactivate request');
    }));
  }));
  describe('parseSignedDataPayload()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should throw if signedData contains an additional unknown property.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const didUniqueSuffix = 'anyUnusedDidUniqueSuffix';
      const recoveryRevealValue = 'anyUnusedRecoveryRevealValue';
      const signedData = {
        didSuffix: didUniqueSuffix,
        revealValue: recoveryRevealValue,
        extraProperty: 'An unknown extra property'
      };
      const signedDataEncodedString = Encoder_1.default.encode(JSON.stringify(signedData));
      yield expectAsync(DeactivateOperation_1.default.parseSignedDataPayload(signedDataEncodedString, didUniqueSuffix))
        .toBeRejectedWith(new SidetreeError_1.default(ErrorCode_1.default.DeactivateOperationSignedDataMissingOrUnknownProperty));
      done();
    }));
    it('should throw if signedData is missing expected properties.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const didUniqueSuffix = 'anyUnusedDidUniqueSuffix';
      const signedData = {};
      const signedDataEncodedString = Encoder_1.default.encode(JSON.stringify(signedData));
      yield expectAsync(DeactivateOperation_1.default.parseSignedDataPayload(signedDataEncodedString, didUniqueSuffix))
        .toBeRejectedWith(new SidetreeError_1.default(ErrorCode_1.default.DeactivateOperationSignedDataMissingOrUnknownProperty));
      done();
    }));
    it('should throw if signed `didUniqueSuffix` is mismatching.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const didUniqueSuffix = 'anyUnusedDidUniqueSuffix';
      const recoveryRevealValue = 'anyUnusedRecoveryRevealValue';
      const signedData = {
        didSuffix: didUniqueSuffix,
        revealValue: recoveryRevealValue
      };
      const encodedSignedData = Encoder_1.default.encode(JSON.stringify(signedData));
      yield expectAsync(DeactivateOperation_1.default.parseSignedDataPayload(encodedSignedData, 'mismatchingDidUniqueSuffix'))
        .toBeRejectedWith(new SidetreeError_1.default(ErrorCode_1.default.DeactivateOperationSignedDidUniqueSuffixMismatch));
      done();
    }));
  }));
}));
// # sourceMappingURL=DeactivateOperation.spec.js.map
