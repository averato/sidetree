"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Did_1 = require("./Did");
const ErrorCode_1 = require("./ErrorCode");
const InputValidator_1 = require("./InputValidator");
const JsonAsync_1 = require("./util/JsonAsync");
const Operation_1 = require("./Operation");
const OperationType_1 = require("../../enums/OperationType");
const SidetreeError_1 = require("../../../common/SidetreeError");
class CreateOperation {
    constructor(operationBuffer, didUniqueSuffix, suffixData, delta) {
        this.operationBuffer = operationBuffer;
        this.didUniqueSuffix = didUniqueSuffix;
        this.suffixData = suffixData;
        this.delta = delta;
        this.type = OperationType_1.default.Create;
    }
    static parse(operationBuffer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const operationJsonString = operationBuffer.toString();
            const operationObject = yield JsonAsync_1.default.parse(operationJsonString);
            const createOperation = CreateOperation.parseObject(operationObject, operationBuffer);
            return createOperation;
        });
    }
    static parseObject(operationObject, operationBuffer) {
        const expectedPropertyCount = 3;
        const properties = Object.keys(operationObject);
        if (properties.length !== expectedPropertyCount) {
            throw new SidetreeError_1.default(ErrorCode_1.default.CreateOperationMissingOrUnknownProperty);
        }
        if (operationObject.type !== OperationType_1.default.Create) {
            throw new SidetreeError_1.default(ErrorCode_1.default.CreateOperationTypeIncorrect);
        }
        const suffixData = operationObject.suffixData;
        InputValidator_1.default.validateSuffixData(suffixData);
        let delta;
        try {
            Operation_1.default.validateDelta(operationObject.delta);
            delta = operationObject.delta;
        }
        catch (_a) {
        }
        const didUniqueSuffix = Did_1.default.computeUniqueSuffix(suffixData);
        return new CreateOperation(operationBuffer, didUniqueSuffix, suffixData, delta);
    }
}
exports.default = CreateOperation;
//# sourceMappingURL=CreateOperation.js.map