"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Encoder_1 = require("./Encoder");
const ErrorCode_1 = require("./ErrorCode");
const InputValidator_1 = require("./InputValidator");
const JsonAsync_1 = require("./util/JsonAsync");
const Jwk_1 = require("./util/Jwk");
const Jws_1 = require("./util/Jws");
const Multihash_1 = require("./Multihash");
const OperationType_1 = require("../../enums/OperationType");
const SidetreeError_1 = require("../../../common/SidetreeError");
class DeactivateOperation {
    constructor(operationBuffer, didUniqueSuffix, revealValue, signedDataJws, signedData) {
        this.operationBuffer = operationBuffer;
        this.didUniqueSuffix = didUniqueSuffix;
        this.revealValue = revealValue;
        this.signedDataJws = signedDataJws;
        this.signedData = signedData;
        this.type = OperationType_1.default.Deactivate;
    }
    static parse(operationBuffer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const operationJsonString = operationBuffer.toString();
            const operationObject = yield JsonAsync_1.default.parse(operationJsonString);
            const deactivateOperation = yield DeactivateOperation.parseObject(operationObject, operationBuffer);
            return deactivateOperation;
        });
    }
    static parseObject(operationObject, operationBuffer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            InputValidator_1.default.validateObjectContainsOnlyAllowedProperties(operationObject, ['type', 'didSuffix', 'revealValue', 'signedData'], 'deactivate request');
            if (operationObject.type !== OperationType_1.default.Deactivate) {
                throw new SidetreeError_1.default(ErrorCode_1.default.DeactivateOperationTypeIncorrect);
            }
            InputValidator_1.default.validateEncodedMultihash(operationObject.didSuffix, 'deactivate request didSuffix');
            InputValidator_1.default.validateEncodedMultihash(operationObject.revealValue, 'deactivate request reveal value');
            const signedDataJws = Jws_1.default.parseCompactJws(operationObject.signedData);
            const signedDataModel = yield DeactivateOperation.parseSignedDataPayload(signedDataJws.payload, operationObject.didSuffix);
            Multihash_1.default.validateCanonicalizeObjectHash(signedDataModel.recoveryKey, operationObject.revealValue, 'deactivate request recovery key');
            return new DeactivateOperation(operationBuffer, operationObject.didSuffix, operationObject.revealValue, signedDataJws, signedDataModel);
        });
    }
    static parseSignedDataPayload(signedDataEncodedString, expectedDidUniqueSuffix) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const signedDataJsonString = Encoder_1.default.decodeAsString(signedDataEncodedString);
            const signedData = yield JsonAsync_1.default.parse(signedDataJsonString);
            const properties = Object.keys(signedData);
            if (properties.length !== 2) {
                throw new SidetreeError_1.default(ErrorCode_1.default.DeactivateOperationSignedDataMissingOrUnknownProperty);
            }
            if (signedData.didSuffix !== expectedDidUniqueSuffix) {
                throw new SidetreeError_1.default(ErrorCode_1.default.DeactivateOperationSignedDidUniqueSuffixMismatch);
            }
            Jwk_1.default.validateJwkEs256k(signedData.recoveryKey);
            return signedData;
        });
    }
}
exports.default = DeactivateOperation;
//# sourceMappingURL=DeactivateOperation.js.map