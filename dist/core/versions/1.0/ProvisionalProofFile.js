'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const Compressor_1 = require('./util/Compressor');
const ErrorCode_1 = require('./ErrorCode');
const InputValidator_1 = require('./InputValidator');
const JsonAsync_1 = require('./util/JsonAsync');
const Jws_1 = require('./util/Jws');
const ProtocolParameters_1 = require('./ProtocolParameters');
const SidetreeError_1 = require('../../../common/SidetreeError');
const UpdateOperation_1 = require('./UpdateOperation');
class ProvisionalProofFile {
  constructor (provisionalProofFileModel, updateProofs) {
    this.provisionalProofFileModel = provisionalProofFileModel;
    this.updateProofs = updateProofs;
  }

  static createBuffer (updateOperations) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (updateOperations.length === 0) {
        return undefined;
      }
      const updateProofs = updateOperations.map(operation => { return { signedData: operation.signedDataJws.toCompactJws() }; });
      const provisionalProofFileModel = {
        operations: {
          update: updateProofs
        }
      };
      const rawData = Buffer.from(JSON.stringify(provisionalProofFileModel));
      const compressedRawData = yield Compressor_1.default.compress(Buffer.from(rawData));
      return compressedRawData;
    });
  }

  static parse (provisionalProofFileBuffer) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      let provisionalProofFileDecompressedBuffer;
      try {
        const maxAllowedDecompressedSizeInBytes = ProtocolParameters_1.default.maxProofFileSizeInBytes * Compressor_1.default.estimatedDecompressionMultiplier;
        provisionalProofFileDecompressedBuffer = yield Compressor_1.default.decompress(provisionalProofFileBuffer, maxAllowedDecompressedSizeInBytes);
      } catch (error) {
        if (error instanceof SidetreeError_1.default) { throw SidetreeError_1.default.createFromError(ErrorCode_1.default.ProvisionalProofFileDecompressionFailure, error); }
        throw error;
      }
      let provisionalProofFileModel;
      try {
        provisionalProofFileModel = yield JsonAsync_1.default.parse(provisionalProofFileDecompressedBuffer);
      } catch (error) {
        if (error instanceof SidetreeError_1.default) { throw SidetreeError_1.default.createFromError(ErrorCode_1.default.ProvisionalProofFileNotJson, error); }
        throw error;
      }
      if (provisionalProofFileModel.operations === undefined) {
        throw new SidetreeError_1.default(ErrorCode_1.default.ProvisionalProofFileOperationsNotFound, `Provisional proof file does not have any operation proofs.`);
      }
      const operations = provisionalProofFileModel.operations;
      InputValidator_1.default.validateObjectContainsOnlyAllowedProperties(operations, ['update'], 'provisional proof file');
      const updateProofs = [];
      const updateProofModels = operations.update;
      if (!Array.isArray(updateProofModels)) {
        throw new SidetreeError_1.default(ErrorCode_1.default.ProvisionalProofFileUpdatePropertyNotAnArray, `'update' property in provisional proof file is not an array with entries.`);
      }
      for (const proof of updateProofModels) {
        InputValidator_1.default.validateObjectContainsOnlyAllowedProperties(proof, ['signedData'], 'update proof');
        const signedDataJws = Jws_1.default.parseCompactJws(proof.signedData);
        const signedDataModel = yield UpdateOperation_1.default.parseSignedDataPayload(signedDataJws.payload);
        updateProofs.push({
          signedDataJws,
          signedDataModel
        });
      }
      if (updateProofs.length === 0) {
        throw new SidetreeError_1.default(ErrorCode_1.default.ProvisionalProofFileHasNoProofs, `Provisional proof file has no proofs.`);
      }
      return new ProvisionalProofFile(provisionalProofFileModel, updateProofs);
    });
  }
}
exports.default = ProvisionalProofFile;
// # sourceMappingURL=ProvisionalProofFile.js.map
