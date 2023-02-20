"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Compressor_1 = require("./util/Compressor");
const DeactivateOperation_1 = require("./DeactivateOperation");
const ErrorCode_1 = require("./ErrorCode");
const InputValidator_1 = require("./InputValidator");
const JsonAsync_1 = require("./util/JsonAsync");
const Jws_1 = require("./util/Jws");
const ProtocolParameters_1 = require("./ProtocolParameters");
const RecoverOperation_1 = require("./RecoverOperation");
const SidetreeError_1 = require("../../../common/SidetreeError");
class CoreProofFile {
    constructor(coreProofFileModel, recoverProofs, deactivateProofs) {
        this.coreProofFileModel = coreProofFileModel;
        this.recoverProofs = recoverProofs;
        this.deactivateProofs = deactivateProofs;
    }
    static createBuffer(recoverOperations, deactivateOperations) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (recoverOperations.length === 0 && deactivateOperations.length === 0) {
                return undefined;
            }
            const recoverProofs = recoverOperations.map(operation => { return { signedData: operation.signedDataJws.toCompactJws() }; });
            const deactivateProofs = deactivateOperations.map(operation => { return { signedData: operation.signedDataJws.toCompactJws() }; });
            const coreProofFileModel = {
                operations: {
                    recover: recoverProofs,
                    deactivate: deactivateProofs
                }
            };
            const rawData = Buffer.from(JSON.stringify(coreProofFileModel));
            const compressedRawData = yield Compressor_1.default.compress(Buffer.from(rawData));
            return compressedRawData;
        });
    }
    static parse(coreProofFileBuffer, expectedDeactivatedDidUniqueSuffixes) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let coreProofFileDecompressedBuffer;
            try {
                const maxAllowedDecompressedSizeInBytes = ProtocolParameters_1.default.maxProofFileSizeInBytes * Compressor_1.default.estimatedDecompressionMultiplier;
                coreProofFileDecompressedBuffer = yield Compressor_1.default.decompress(coreProofFileBuffer, maxAllowedDecompressedSizeInBytes);
            }
            catch (error) {
                if (error instanceof SidetreeError_1.default)
                    throw SidetreeError_1.default.createFromError(ErrorCode_1.default.CoreProofFileDecompressionFailure, error);
                throw error;
            }
            let coreProofFileModel;
            try {
                coreProofFileModel = yield JsonAsync_1.default.parse(coreProofFileDecompressedBuffer);
            }
            catch (error) {
                if (error instanceof SidetreeError_1.default)
                    throw SidetreeError_1.default.createFromError(ErrorCode_1.default.CoreProofFileNotJson, error);
                throw error;
            }
            if (coreProofFileModel.operations === undefined) {
                throw new SidetreeError_1.default(ErrorCode_1.default.CoreProofFileOperationsNotFound, `Core proof file does not have any operation proofs.`);
            }
            const operations = coreProofFileModel.operations;
            InputValidator_1.default.validateObjectContainsOnlyAllowedProperties(operations, ['recover', 'deactivate'], 'core proof file');
            const recoverProofs = [];
            const deactivateProofs = [];
            let numberOfProofs = 0;
            const recoverProofModels = operations.recover;
            if (recoverProofModels !== undefined) {
                if (!Array.isArray(recoverProofModels)) {
                    throw new SidetreeError_1.default(ErrorCode_1.default.CoreProofFileRecoverPropertyNotAnArray, `'recover' property in core proof file is not an array.`);
                }
                for (const proof of recoverProofModels) {
                    InputValidator_1.default.validateObjectContainsOnlyAllowedProperties(proof, ['signedData'], 'recover proof');
                    const signedDataJws = Jws_1.default.parseCompactJws(proof.signedData);
                    const signedDataModel = yield RecoverOperation_1.default.parseSignedDataPayload(signedDataJws.payload);
                    recoverProofs.push({
                        signedDataJws,
                        signedDataModel
                    });
                }
                numberOfProofs += recoverProofs.length;
            }
            const deactivateProofModels = operations.deactivate;
            if (deactivateProofModels !== undefined) {
                if (!Array.isArray(deactivateProofModels)) {
                    throw new SidetreeError_1.default(ErrorCode_1.default.CoreProofFileDeactivatePropertyNotAnArray, `'deactivate' property in core proof file is not an array.`);
                }
                let deactivateProofIndex = 0;
                for (const proof of deactivateProofModels) {
                    InputValidator_1.default.validateObjectContainsOnlyAllowedProperties(proof, ['signedData'], 'deactivate proof');
                    const signedDataJws = Jws_1.default.parseCompactJws(proof.signedData);
                    const signedDataModel = yield DeactivateOperation_1.default.parseSignedDataPayload(signedDataJws.payload, expectedDeactivatedDidUniqueSuffixes[deactivateProofIndex]);
                    deactivateProofs.push({
                        signedDataJws,
                        signedDataModel
                    });
                    deactivateProofIndex++;
                }
                numberOfProofs += deactivateProofModels.length;
            }
            if (numberOfProofs === 0) {
                throw new SidetreeError_1.default(ErrorCode_1.default.CoreProofFileHasNoProofs, `Core proof file has no proofs.`);
            }
            return new CoreProofFile(coreProofFileModel, recoverProofs, deactivateProofs);
        });
    }
}
exports.default = CoreProofFile;
//# sourceMappingURL=CoreProofFile.js.map