"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ArrayMethods_1 = require("./util/ArrayMethods");
const Compressor_1 = require("./util/Compressor");
const ErrorCode_1 = require("./ErrorCode");
const InputValidator_1 = require("./InputValidator");
const JsonAsync_1 = require("./util/JsonAsync");
const ProtocolParameters_1 = require("./ProtocolParameters");
const SidetreeError_1 = require("../../../common/SidetreeError");
class ProvisionalIndexFile {
    constructor(model, didUniqueSuffixes) {
        this.model = model;
        this.didUniqueSuffixes = didUniqueSuffixes;
    }
    static parse(provisionalIndexFileBuffer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let decompressedBuffer;
            try {
                const maxAllowedDecompressedSizeInBytes = ProtocolParameters_1.default.maxProvisionalIndexFileSizeInBytes * Compressor_1.default.estimatedDecompressionMultiplier;
                decompressedBuffer = yield Compressor_1.default.decompress(provisionalIndexFileBuffer, maxAllowedDecompressedSizeInBytes);
            }
            catch (error) {
                if (error instanceof SidetreeError_1.default)
                    throw SidetreeError_1.default.createFromError(ErrorCode_1.default.ProvisionalIndexFileDecompressionFailure, error);
                throw error;
            }
            let provisionalIndexFileModel;
            try {
                provisionalIndexFileModel = yield JsonAsync_1.default.parse(decompressedBuffer);
            }
            catch (error) {
                if (error instanceof SidetreeError_1.default)
                    throw SidetreeError_1.default.createFromError(ErrorCode_1.default.ProvisionalIndexFileNotJson, error);
                throw error;
            }
            const allowedProperties = new Set(['chunks', 'operations', 'provisionalProofFileUri']);
            for (const property in provisionalIndexFileModel) {
                if (!allowedProperties.has(property)) {
                    throw new SidetreeError_1.default(ErrorCode_1.default.ProvisionalIndexFileHasUnknownProperty);
                }
            }
            ProvisionalIndexFile.validateChunksProperty(provisionalIndexFileModel.chunks);
            const didSuffixes = yield ProvisionalIndexFile.validateOperationsProperty(provisionalIndexFileModel.operations);
            if (didSuffixes.length > 0) {
                InputValidator_1.default.validateCasFileUri(provisionalIndexFileModel.provisionalProofFileUri, 'provisional proof file URI');
            }
            else {
                if (provisionalIndexFileModel.provisionalProofFileUri !== undefined) {
                    throw new SidetreeError_1.default(ErrorCode_1.default.ProvisionalIndexFileProvisionalProofFileUriNotAllowed, `Provisional proof file '${provisionalIndexFileModel.provisionalProofFileUri}' not allowed in a provisional index file with no updates.`);
                }
            }
            const provisionalIndexFile = new ProvisionalIndexFile(provisionalIndexFileModel, didSuffixes);
            return provisionalIndexFile;
        });
    }
    static validateOperationsProperty(operations) {
        if (operations === undefined) {
            return [];
        }
        InputValidator_1.default.validateObjectContainsOnlyAllowedProperties(operations, ['update'], 'provisional operation references');
        if (!Array.isArray(operations.update)) {
            throw new SidetreeError_1.default(ErrorCode_1.default.ProvisionalIndexFileUpdateOperationsNotArray);
        }
        InputValidator_1.default.validateOperationReferences(operations.update, 'update reference');
        const didSuffixes = operations.update.map(operation => operation.didSuffix);
        if (ArrayMethods_1.default.hasDuplicates(didSuffixes)) {
            throw new SidetreeError_1.default(ErrorCode_1.default.ProvisionalIndexFileMultipleOperationsForTheSameDid);
        }
        return didSuffixes;
    }
    static validateChunksProperty(chunks) {
        if (!Array.isArray(chunks)) {
            throw new SidetreeError_1.default(ErrorCode_1.default.ProvisionalIndexFileChunksPropertyMissingOrIncorrectType);
        }
        if (chunks.length !== 1) {
            throw new SidetreeError_1.default(ErrorCode_1.default.ProvisionalIndexFileChunksPropertyDoesNotHaveExactlyOneElement);
        }
        const chunk = chunks[0];
        const properties = Object.keys(chunk);
        if (properties.length !== 1) {
            throw new SidetreeError_1.default(ErrorCode_1.default.ProvisionalIndexFileChunkHasMissingOrUnknownProperty);
        }
        InputValidator_1.default.validateCasFileUri(chunk.chunkFileUri, 'chunk file URI');
    }
    static createBuffer(chunkFileUri, provisionalProofFileUri, updateOperationArray) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const updateReferences = updateOperationArray.map(operation => {
                const revealValue = operation.revealValue;
                return { didSuffix: operation.didUniqueSuffix, revealValue };
            });
            const provisionalIndexFileModel = {
                chunks: [{ chunkFileUri }]
            };
            if (updateReferences.length > 0) {
                provisionalIndexFileModel.operations = {
                    update: updateReferences
                };
                provisionalIndexFileModel.provisionalProofFileUri = provisionalProofFileUri;
            }
            const rawData = JSON.stringify(provisionalIndexFileModel);
            const compressedRawData = yield Compressor_1.default.compress(Buffer.from(rawData));
            return compressedRawData;
        });
    }
}
exports.default = ProvisionalIndexFile;
//# sourceMappingURL=ProvisionalIndexFile.js.map