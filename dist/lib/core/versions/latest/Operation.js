"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const CreateOperation_1 = require("./CreateOperation");
const DeactivateOperation_1 = require("./DeactivateOperation");
const DocumentComposer_1 = require("./DocumentComposer");
const ErrorCode_1 = require("./ErrorCode");
const InputValidator_1 = require("./InputValidator");
const OperationType_1 = require("../../enums/OperationType");
const RecoverOperation_1 = require("./RecoverOperation");
const SidetreeError_1 = require("../../../common/SidetreeError");
const UpdateOperation_1 = require("./UpdateOperation");
class Operation {
    static parse(operationBuffer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const operationJsonString = operationBuffer.toString();
            const operationObject = JSON.parse(operationJsonString);
            const operationType = operationObject.type;
            if (operationType === OperationType_1.default.Create) {
                return CreateOperation_1.default.parseObject(operationObject, operationBuffer);
            }
            else if (operationType === OperationType_1.default.Update) {
                return UpdateOperation_1.default.parseObject(operationObject, operationBuffer);
            }
            else if (operationType === OperationType_1.default.Recover) {
                return RecoverOperation_1.default.parseObject(operationObject, operationBuffer);
            }
            else if (operationType === OperationType_1.default.Deactivate) {
                return DeactivateOperation_1.default.parseObject(operationObject, operationBuffer);
            }
            else {
                throw new SidetreeError_1.default(ErrorCode_1.default.OperationTypeUnknownOrMissing);
            }
        });
    }
    static validateDelta(delta) {
        InputValidator_1.default.validateNonArrayObject(delta, 'delta');
        InputValidator_1.default.validateObjectContainsOnlyAllowedProperties(delta, ['patches', 'updateCommitment'], 'delta');
        DocumentComposer_1.default.validateDocumentPatches(delta.patches);
        InputValidator_1.default.validateEncodedMultihash(delta.updateCommitment, 'update commitment');
    }
}
exports.default = Operation;
Operation.maxEncodedRevealValueLength = 50;
//# sourceMappingURL=Operation.js.map