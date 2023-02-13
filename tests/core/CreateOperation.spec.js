'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const CreateOperation_1 = require('../../lib/core/versions/latest/CreateOperation');
const ErrorCode_1 = require('../../lib/core/versions/latest/ErrorCode');
const Jwk_1 = require('../../lib/core/versions/latest/util/Jwk');
const OperationGenerator_1 = require('../generators/OperationGenerator');
const OperationType_1 = require('../../lib/core/enums/OperationType');
const SidetreeError_1 = require('../../lib/common/SidetreeError');
describe('CreateOperation', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  describe('parseObject', () => {
    it('should leave delta as empty if it is not valid', () => {
      const operationObject = {
        type: 'create',
        suffixData: {
          deltaHash: OperationGenerator_1.default.generateRandomHash(),
          recoveryCommitment: OperationGenerator_1.default.generateRandomHash()
        },
        delta: 'this is not a valid delta'
      };
      const result = CreateOperation_1.default.parseObject(operationObject, Buffer.from('something'));
      expect(result.delta).toBeUndefined();
    });
    it('should throw sidetree error if object contains more or less than 3 properties', () => {
      const twoProperties = { one: 1, two: 2 };
      const fourProperties = { one: 1, two: 2, three: 3, four: 4 };
      try {
        CreateOperation_1.default.parseObject(twoProperties, Buffer.from(JSON.stringify(twoProperties)));
        fail('expect to throw sidetree error but did not');
      } catch (e) {
        expect(e).toEqual(new SidetreeError_1.default(ErrorCode_1.default.CreateOperationMissingOrUnknownProperty));
      }
      try {
        CreateOperation_1.default.parseObject(fourProperties, Buffer.from(JSON.stringify(fourProperties)));
        fail('expect to throw sidetree error but did not');
      } catch (e) {
        expect(e).toEqual(new SidetreeError_1.default(ErrorCode_1.default.CreateOperationMissingOrUnknownProperty));
      }
    });
    it('should throw sidetree error if operation type is not create.', () => {
      const testObject = {
        type: 'notCreate',
        suffixData: {
          deltaHash: OperationGenerator_1.default.generateRandomHash(),
          recoveryCommitment: OperationGenerator_1.default.generateRandomHash()
        },
        delta: 'something'
      };
      try {
        CreateOperation_1.default.parseObject(testObject, Buffer.from(JSON.stringify(testObject)));
        fail('expect to throw sidetree error but did not');
      } catch (e) {
        expect(e).toEqual(new SidetreeError_1.default(ErrorCode_1.default.CreateOperationTypeIncorrect));
      }
    });
  });
  describe('parse()', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    it('should throw if create operation request has more than 3 properties.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const [recoveryPublicKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const [signingPublicKey] = yield OperationGenerator_1.default.generateKeyPair('key2');
      const services = OperationGenerator_1.default.generateServices(['serviceId123']);
      const createOperationRequest = yield OperationGenerator_1.default.createCreateOperationRequest(recoveryPublicKey, signingPublicKey.publicKeyJwk, [signingPublicKey], services);
      createOperationRequest.extraProperty = 'unknown extra property';
      const createOperationBuffer = Buffer.from(JSON.stringify(createOperationRequest));
      yield expectAsync(CreateOperation_1.default.parse(createOperationBuffer)).toBeRejectedWith(new SidetreeError_1.default(ErrorCode_1.default.CreateOperationMissingOrUnknownProperty));
    }));
    it('should throw if operation type is incorrect', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const [recoveryPublicKey] = yield Jwk_1.default.generateEs256kKeyPair();
      const [signingPublicKey] = yield OperationGenerator_1.default.generateKeyPair('key2');
      const services = OperationGenerator_1.default.generateServices(['serviceId123']);
      const createOperationRequest = yield OperationGenerator_1.default.createCreateOperationRequest(recoveryPublicKey, signingPublicKey.publicKeyJwk, [signingPublicKey], services);
      createOperationRequest.type = OperationType_1.default.Deactivate;
      const createOperationBuffer = Buffer.from(JSON.stringify(createOperationRequest));
      yield expectAsync(CreateOperation_1.default.parse(createOperationBuffer)).toBeRejectedWith(new SidetreeError_1.default(ErrorCode_1.default.CreateOperationTypeIncorrect));
    }));
  }));
}));
// # sourceMappingURL=CreateOperation.spec.js.map
