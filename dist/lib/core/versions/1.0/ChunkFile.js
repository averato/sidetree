"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const timeSpan = require("time-span");
const Compressor_1 = require("./util/Compressor");
const Delta_1 = require("./Delta");
const ErrorCode_1 = require("./ErrorCode");
const JsonAsync_1 = require("./util/JsonAsync");
const Logger_1 = require("../../../common/Logger");
const ProtocolParameters_1 = require("./ProtocolParameters");
const SidetreeError_1 = require("../../../common/SidetreeError");
class ChunkFile {
    static parse(chunkFileBuffer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const endTimer = timeSpan();
            const maxAllowedDecompressedSizeInBytes = ProtocolParameters_1.default.maxChunkFileSizeInBytes * Compressor_1.default.estimatedDecompressionMultiplier;
            const decompressedChunkFileBuffer = yield Compressor_1.default.decompress(chunkFileBuffer, maxAllowedDecompressedSizeInBytes);
            const chunkFileObject = yield JsonAsync_1.default.parse(decompressedChunkFileBuffer);
            Logger_1.default.info(`Parsed chunk file in ${endTimer.rounded()} ms.`);
            const allowedProperties = new Set(['deltas']);
            for (const property in chunkFileObject) {
                if (!allowedProperties.has(property)) {
                    throw new SidetreeError_1.default(ErrorCode_1.default.ChunkFileUnexpectedProperty, `Unexpected property ${property} in chunk file.`);
                }
            }
            this.validateDeltasProperty(chunkFileObject.deltas);
            return chunkFileObject;
        });
    }
    static validateDeltasProperty(deltas) {
        if (!(deltas instanceof Array)) {
            throw new SidetreeError_1.default(ErrorCode_1.default.ChunkFileDeltasPropertyNotArray, 'Invalid chunk file, deltas property is not an array.');
        }
        for (const delta of deltas) {
            if (typeof delta !== 'object') {
                throw new SidetreeError_1.default(ErrorCode_1.default.ChunkFileDeltasNotArrayOfObjects, 'Invalid chunk file, deltas property is not an array of objects.');
            }
            Delta_1.default.validateDelta(delta);
        }
    }
    static createBuffer(createOperations, recoverOperations, updateOperations) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const deltas = [];
            deltas.push(...createOperations.map(operation => operation.delta));
            deltas.push(...recoverOperations.map(operation => operation.delta));
            deltas.push(...updateOperations.map(operation => operation.delta));
            if (deltas.length === 0) {
                return undefined;
            }
            const chunkFileModel = {
                deltas
            };
            const rawData = Buffer.from(JSON.stringify(chunkFileModel));
            const compressedRawData = yield Compressor_1.default.compress(Buffer.from(rawData));
            return compressedRawData;
        });
    }
}
exports.default = ChunkFile;
//# sourceMappingURL=ChunkFile.js.map