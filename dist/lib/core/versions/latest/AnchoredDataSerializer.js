"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ErrorCode_1 = tslib_1.__importDefault(require("./ErrorCode"));
const ProtocolParameters_1 = tslib_1.__importDefault(require("./ProtocolParameters"));
const SidetreeError_1 = tslib_1.__importDefault(require("../../../common/SidetreeError"));
class AnchoredDataSerializer {
    static serialize(dataToBeAnchored) {
        return `${dataToBeAnchored.numberOfOperations}${AnchoredDataSerializer.delimiter}${dataToBeAnchored.coreIndexFileUri}`;
    }
    static deserialize(serializedData) {
        const splitData = serializedData.split(AnchoredDataSerializer.delimiter);
        if (splitData.length !== 2) {
            throw new SidetreeError_1.default(ErrorCode_1.default.AnchoredDataIncorrectFormat, `Input is not in correct format: ${serializedData}`);
        }
        const numberOfOperations = AnchoredDataSerializer.parsePositiveInteger(splitData[0]);
        if (numberOfOperations > ProtocolParameters_1.default.maxOperationsPerBatch) {
            throw new SidetreeError_1.default(ErrorCode_1.default.AnchoredDataNumberOfOperationsGreaterThanMax, `Number of operations ${numberOfOperations} must be less than or equal to ${ProtocolParameters_1.default.maxOperationsPerBatch}`);
        }
        return {
            coreIndexFileUri: splitData[1],
            numberOfOperations: numberOfOperations
        };
    }
    static parsePositiveInteger(input) {
        const isPositiveInteger = /^[1-9]\d*$/.test(input);
        if (!isPositiveInteger) {
            throw new SidetreeError_1.default(ErrorCode_1.default.AnchoredDataNumberOfOperationsNotPositiveInteger, `Number of operations '${input}' is not a positive integer without leading zeros.`);
        }
        return Number(input);
    }
}
exports.default = AnchoredDataSerializer;
AnchoredDataSerializer.delimiter = '.';
//# sourceMappingURL=AnchoredDataSerializer.js.map