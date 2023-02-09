"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const AnchoredDataSerializer_1 = require("../../../lib/core/versions/latest/AnchoredDataSerializer");
const ErrorCode_1 = require("../../../lib/core/versions/latest/ErrorCode");
const JasmineSidetreeErrorValidator_1 = require("../../JasmineSidetreeErrorValidator");
describe('AnchoredDataSerializer', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let testDataToWrite;
    beforeEach(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        testDataToWrite = {
            coreIndexFileUri: 'random data to write',
            numberOfOperations: 10000
        };
    }));
    it('should serialize & deserialize correctly.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const serialized = AnchoredDataSerializer_1.default.serialize(testDataToWrite);
        const deserialized = AnchoredDataSerializer_1.default.deserialize(serialized);
        expect(deserialized.coreIndexFileUri).toEqual(testDataToWrite.coreIndexFileUri);
        expect(deserialized.numberOfOperations).toEqual(testDataToWrite.numberOfOperations);
    }));
    describe(`deserialize()`, () => {
        it('deserialize should throw if the input is not in the correct format.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => AnchoredDataSerializer_1.default.deserialize('SOMEINVALIDDATA'), ErrorCode_1.default.AnchoredDataIncorrectFormat);
        }));
        it('should throw if the number of operations is not a number.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const anchorString = `abc${AnchoredDataSerializer_1.default.delimiter}unusedCoreIndexFileUri`;
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => AnchoredDataSerializer_1.default.deserialize(anchorString), ErrorCode_1.default.AnchoredDataNumberOfOperationsNotPositiveInteger);
        }));
        it('should throw if the number of operations is not a positive integer.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const anchorString = `0${AnchoredDataSerializer_1.default.delimiter}unusedCoreIndexFileUri`;
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => AnchoredDataSerializer_1.default.deserialize(anchorString), ErrorCode_1.default.AnchoredDataNumberOfOperationsNotPositiveInteger);
        }));
        it('should throw if the number of operations exceeds max allowed.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const anchorString = `10001${AnchoredDataSerializer_1.default.delimiter}unusedCoreIndexFileUri`;
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => AnchoredDataSerializer_1.default.deserialize(anchorString), ErrorCode_1.default.AnchoredDataNumberOfOperationsGreaterThanMax);
        }));
    });
}));
//# sourceMappingURL=AnchoredDataSerializer.spec.js.map