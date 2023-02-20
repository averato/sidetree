'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const Encoder_1 = require('./Encoder');
const ErrorCode_1 = require('./ErrorCode');
const InputValidator_1 = require('./InputValidator');
const JsonAsync_1 = require('./util/JsonAsync');
const Jwk_1 = require('./util/Jwk');
const Jws_1 = require('./util/Jws');
const Multihash_1 = require('./Multihash');
const Operation_1 = require('./Operation');
const OperationType_1 = require('../../enums/OperationType');
const SidetreeError_1 = require('../../../common/SidetreeError');
class RecoverOperation {
  constructor (operationBuffer, didUniqueSuffix, revealValue, signedDataJws, signedData, delta) {
    this.operationBuffer = operationBuffer;
    this.didUniqueSuffix = didUniqueSuffix;
    this.revealValue = revealValue;
    this.signedDataJws = signedDataJws;
    this.signedData = signedData;
    this.delta = delta;
    this.type = OperationType_1.default.Recover;
  }

  static parse (operationBuffer) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const operationJsonString = operationBuffer.toString();
      const operationObject = yield JsonAsync_1.default.parse(operationJsonString);
      const recoverOperation = yield RecoverOperation.parseObject(operationObject, operationBuffer);
      return recoverOperation;
    });
  }

  static parseObject (operationObject, operationBuffer) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      InputValidator_1.default.validateObjectContainsOnlyAllowedProperties(operationObject, ['type', 'didSuffix', 'revealValue', 'signedData', 'delta'], 'recover request');
      if (operationObject.type !== OperationType_1.default.Recover) {
        throw new SidetreeError_1.default(ErrorCode_1.default.RecoverOperationTypeIncorrect);
      }
      InputValidator_1.default.validateEncodedMultihash(operationObject.didSuffix, 'recover request didSuffix');
      InputValidator_1.default.validateEncodedMultihash(operationObject.revealValue, 'recover request reveal value');
      const signedDataJws = Jws_1.default.parseCompactJws(operationObject.signedData);
      const signedDataModel = yield RecoverOperation.parseSignedDataPayload(signedDataJws.payload);
      Multihash_1.default.validateCanonicalizeObjectHash(signedDataModel.recoveryKey, operationObject.revealValue, 'recover request recovery key');
      let delta;
      try {
        Operation_1.default.validateDelta(operationObject.delta);
        delta = operationObject.delta;
      } catch (_a) {
      }
      return new RecoverOperation(operationBuffer, operationObject.didSuffix, operationObject.revealValue, signedDataJws, signedDataModel, delta);
    });
  }

  static parseSignedDataPayload (signedDataEncodedString) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const signedDataJsonString = Encoder_1.default.decodeAsString(signedDataEncodedString);
      const signedData = yield JsonAsync_1.default.parse(signedDataJsonString);
      const properties = Object.keys(signedData);
      if (properties.length !== 3) {
        throw new SidetreeError_1.default(ErrorCode_1.default.RecoverOperationSignedDataMissingOrUnknownProperty);
      }
      Jwk_1.default.validateJwkEs256k(signedData.recoveryKey);
      InputValidator_1.default.validateEncodedMultihash(signedData.deltaHash, 'recover operation delta hash');
      InputValidator_1.default.validateEncodedMultihash(signedData.recoveryCommitment, 'recover operation next recovery commitment');
      return signedData;
    });
  }
}
exports.default = RecoverOperation;
// # sourceMappingURL=RecoverOperation.js.map
