"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto = require("crypto");
const ChunkFile_1 = require("../../lib/core/versions/latest/ChunkFile");
const Compressor_1 = require("../../lib/core/versions/latest/util/Compressor");
const Encoder_1 = require("../../lib/core/versions/latest/Encoder");
const ErrorCode_1 = require("../../lib/core/versions/latest/ErrorCode");
const JasmineSidetreeErrorValidator_1 = require("../JasmineSidetreeErrorValidator");
const Jwk_1 = require("../../lib/core/versions/latest/util/Jwk");
const OperationGenerator_1 = require("../generators/OperationGenerator");
describe('ChunkFile', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    describe('parse()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should throw exception if there is an unknown property.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const createOperationData = yield OperationGenerator_1.default.generateCreateOperation();
            const createOperation = createOperationData.createOperation;
            const chunkFileModel = {
                deltas: [
                    createOperation.delta
                ],
                unexpectedProperty: 'any value'
            };
            const rawData = Buffer.from(JSON.stringify(chunkFileModel));
            const compressedRawData = yield Compressor_1.default.compress(Buffer.from(rawData));
            yield JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrownAsync(() => ChunkFile_1.default.parse(compressedRawData), ErrorCode_1.default.ChunkFileUnexpectedProperty);
        }));
    }));
    describe('createBuffer()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should create the buffer correctly.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const createOperationData = yield OperationGenerator_1.default.generateCreateOperation();
            const createOperation = createOperationData.createOperation;
            const [, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const recoverOperationData = yield OperationGenerator_1.default.generateRecoverOperation({
                didUniqueSuffix: 'EiDyOQbbZAa3aiRzeCkV7LOx3SERjjH93EXoIM3UoN4oWg',
                recoveryPrivateKey
            });
            const recoverOperation = recoverOperationData.recoverOperation;
            const chunkFileBuffer = yield ChunkFile_1.default.createBuffer([createOperation], [recoverOperation], []);
            const decompressedChunkFileModel = yield ChunkFile_1.default.parse(chunkFileBuffer);
            expect(decompressedChunkFileModel.deltas.length).toEqual(2);
            expect(decompressedChunkFileModel.deltas[0]).toEqual(createOperation.delta);
            expect(decompressedChunkFileModel.deltas[1]).toEqual(recoverOperation.delta);
        }));
    }));
    describe('validateDeltasProperty()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should throw is `delta` property is not an array.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const deltas = 'Incorrect type.';
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => ChunkFile_1.default.validateDeltasProperty(deltas), ErrorCode_1.default.ChunkFileDeltasPropertyNotArray);
        }));
        it('should throw if any `delta` element is not a string.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const deltas = [
                1, 2, 3
            ];
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => ChunkFile_1.default.validateDeltasProperty(deltas), ErrorCode_1.default.ChunkFileDeltasNotArrayOfObjects);
        }));
        it('should throw if any `delta` element exceeds max size.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const randomBytes = crypto.randomBytes(2000);
            const deltas = [
                {
                    objectKey: Encoder_1.default.encode(randomBytes)
                }
            ];
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => ChunkFile_1.default.validateDeltasProperty(deltas), ErrorCode_1.default.DeltaExceedsMaximumSize);
        }));
    }));
}));
//# sourceMappingURL=ChunkFile.spec.js.map