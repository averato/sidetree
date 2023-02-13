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
class UpdateOperation {
  constructor (operationBuffer, didUniqueSuffix, revealValue, signedDataJws, signedData, delta) {
    this.operationBuffer = operationBuffer;
    this.didUniqueSuffix = didUniqueSuffix;
    this.revealValue = revealValue;
    this.signedDataJws = signedDataJws;
    this.signedData = signedData;
    this.delta = delta;
    this.type = OperationType_1.default.Update;
  }

  static parse (operationBuffer) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const operationJsonString = operationBuffer.toString();
      const operationObject = yield JsonAsync_1.default.parse(operationJsonString);
      const updateOperation = yield UpdateOperation.parseObject(operationObject, operationBuffer);
      return updateOperation;
    });
  }

  static parseObject (operationObject, operationBuffer) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      InputValidator_1.default.validateObjectContainsOnlyAllowedProperties(operationObject, ['type', 'didSuffix', 'revealValue', 'signedData', 'delta'], 'update request');
      if (operationObject.type !== OperationType_1.default.Update) {
        throw new SidetreeError_1.default(ErrorCode_1.default.UpdateOperationTypeIncorrect);
      }
      InputValidator_1.default.validateEncodedMultihash(operationObject.didSuffix, 'update request didSuffix');
      InputValidator_1.default.validateEncodedMultihash(operationObject.revealValue, 'update request reveal value');
      const signedData = Jws_1.default.parseCompactJws(operationObject.signedData);
      const signedDataModel = yield UpdateOperation.parseSignedDataPayload(signedData.payload);
      Multihash_1.default.validateCanonicalizeObjectHash(signedDataModel.updateKey, operationObject.revealValue, 'update request update key');
      Operation_1.default.validateDelta(operationObject.delta);
      return new UpdateOperation(operationBuffer, operationObject.didSuffix, operationObject.revealValue, signedData, signedDataModel, operationObject.delta);
    });
  }

  static parseSignedDataPayload (signedDataEncodedString) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const signedDataJsonString = Encoder_1.default.decodeAsString(signedDataEncodedString);
      const signedData = yield JsonAsync_1.default.parse(signedDataJsonString);
      const properties = Object.keys(signedData);
      if (properties.length !== 2) {
        throw new SidetreeError_1.default(ErrorCode_1.default.UpdateOperationSignedDataHasMissingOrUnknownProperty);
      }
      Jwk_1.default.validateJwkEs256k(signedData.updateKey);
      InputValidator_1.default.validateEncodedMultihash(signedData.deltaHash, 'update operation delta hash');
      return signedData;
    });
  }
}
exports.default = UpdateOperation;
// # sourceMappingURL=UpdateOperation.js.map
