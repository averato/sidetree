'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const ArrayMethods_1 = require('./util/ArrayMethods');
const Compressor_1 = require('./util/Compressor');
const Did_1 = require('./Did');
const ErrorCode_1 = require('./ErrorCode');
const InputValidator_1 = require('./InputValidator');
const JsonAsync_1 = require('./util/JsonAsync');
const ProtocolParameters_1 = require('./ProtocolParameters');
const SidetreeError_1 = require('../../../common/SidetreeError');
class CoreIndexFile {
  constructor (model, didUniqueSuffixes, createDidSuffixes, recoverDidSuffixes, deactivateDidSuffixes) {
    this.model = model;
    this.didUniqueSuffixes = didUniqueSuffixes;
    this.createDidSuffixes = createDidSuffixes;
    this.recoverDidSuffixes = recoverDidSuffixes;
    this.deactivateDidSuffixes = deactivateDidSuffixes;
  }

  static parse (coreIndexFileBuffer) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      let coreIndexFileDecompressedBuffer;
      try {
        const maxAllowedDecompressedSizeInBytes = ProtocolParameters_1.default.maxCoreIndexFileSizeInBytes * Compressor_1.default.estimatedDecompressionMultiplier;
        coreIndexFileDecompressedBuffer = yield Compressor_1.default.decompress(coreIndexFileBuffer, maxAllowedDecompressedSizeInBytes);
      } catch (e) {
        throw SidetreeError_1.default.createFromError(ErrorCode_1.default.CoreIndexFileDecompressionFailure, e);
      }
      let coreIndexFileModel;
      try {
        coreIndexFileModel = yield JsonAsync_1.default.parse(coreIndexFileDecompressedBuffer);
      } catch (e) {
        throw SidetreeError_1.default.createFromError(ErrorCode_1.default.CoreIndexFileNotJson, e);
      }
      const allowedProperties = new Set(['provisionalIndexFileUri', 'coreProofFileUri', 'operations', 'writerLockId']);
      for (const property in coreIndexFileModel) {
        if (!allowedProperties.has(property)) {
          throw new SidetreeError_1.default(ErrorCode_1.default.CoreIndexFileHasUnknownProperty);
        }
      }
      if (('writerLockId' in coreIndexFileModel)) {
        if (typeof coreIndexFileModel.writerLockId !== 'string') {
          throw new SidetreeError_1.default(ErrorCode_1.default.CoreIndexFileWriterLockIdPropertyNotString);
        }
        CoreIndexFile.validateWriterLockId(coreIndexFileModel.writerLockId);
      }
      let operations = {};
      if ('operations' in coreIndexFileModel) {
        operations = coreIndexFileModel.operations;
      }
      const allowedOperationsProperties = new Set(['create', 'recover', 'deactivate']);
      for (const property in operations) {
        if (!allowedOperationsProperties.has(property)) {
          throw new SidetreeError_1.default(ErrorCode_1.default.CoreIndexFileUnexpectedPropertyInOperations, `Unexpected property ${property} in 'operations' property in core index file.`);
        }
      }
      const didUniqueSuffixes = [];
      let createDidSuffixes = [];
      if (operations.create !== undefined) {
        if (!Array.isArray(operations.create)) {
          throw new SidetreeError_1.default(ErrorCode_1.default.CoreIndexFileCreatePropertyNotArray);
        }
        CoreIndexFile.validateCreateReferences(operations.create);
        createDidSuffixes = operations.create.map(operation => Did_1.default.computeUniqueSuffix(operation.suffixData));
        didUniqueSuffixes.push(...createDidSuffixes);
      }
      let recoverDidSuffixes = [];
      if (operations.recover !== undefined) {
        if (!Array.isArray(operations.recover)) {
          throw new SidetreeError_1.default(ErrorCode_1.default.CoreIndexFileRecoverPropertyNotArray);
        }
        InputValidator_1.default.validateOperationReferences(operations.recover, 'recover reference');
        recoverDidSuffixes = operations.recover.map(operation => operation.didSuffix);
        didUniqueSuffixes.push(...recoverDidSuffixes);
      }
      let deactivateDidSuffixes = [];
      if (operations.deactivate !== undefined) {
        if (!Array.isArray(operations.deactivate)) {
          throw new SidetreeError_1.default(ErrorCode_1.default.CoreIndexFileDeactivatePropertyNotArray);
        }
        InputValidator_1.default.validateOperationReferences(operations.deactivate, 'deactivate reference');
        deactivateDidSuffixes = operations.deactivate.map(operation => operation.didSuffix);
        didUniqueSuffixes.push(...deactivateDidSuffixes);
      }
      if (ArrayMethods_1.default.hasDuplicates(didUniqueSuffixes)) {
        throw new SidetreeError_1.default(ErrorCode_1.default.CoreIndexFileMultipleOperationsForTheSameDid);
      }
      if (!('provisionalIndexFileUri' in coreIndexFileModel)) {
        const createPlusRecoverOperationCount = createDidSuffixes.length + recoverDidSuffixes.length;
        if (createPlusRecoverOperationCount !== 0) {
          throw new SidetreeError_1.default(ErrorCode_1.default.CoreIndexFileProvisionalIndexFileUriMissing, `Provisional index file URI must exist since there are ${createDidSuffixes.length} creates and ${recoverDidSuffixes.length} recoveries.`);
        }
      } else {
        InputValidator_1.default.validateCasFileUri(coreIndexFileModel.provisionalIndexFileUri, 'provisional index file URI');
      }
      if (recoverDidSuffixes.length > 0 || deactivateDidSuffixes.length > 0) {
        InputValidator_1.default.validateCasFileUri(coreIndexFileModel.coreProofFileUri, 'core proof file URI');
      } else {
        if (coreIndexFileModel.coreProofFileUri !== undefined) {
          throw new SidetreeError_1.default(ErrorCode_1.default.CoreIndexFileCoreProofFileUriNotAllowed, `Core proof file '${coreIndexFileModel.coreProofFileUri}' not allowed in an core index file with no recovers and deactivates.`);
        }
      }
      const coreIndexFile = new CoreIndexFile(coreIndexFileModel, didUniqueSuffixes, createDidSuffixes, recoverDidSuffixes, deactivateDidSuffixes);
      return coreIndexFile;
    });
  }

  static createModel (writerLockId, provisionalIndexFileUri, coreProofFileUri, createOperationArray, recoverOperationArray, deactivateOperationArray) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      if (writerLockId !== undefined) {
        CoreIndexFile.validateWriterLockId(writerLockId);
      }
      const coreIndexFileModel = {
        writerLockId,
        provisionalIndexFileUri
      };
      if (createOperationArray.length > 0 ||
                recoverOperationArray.length > 0 ||
                deactivateOperationArray.length > 0) {
        coreIndexFileModel.operations = {};
      }
      const createReferences = createOperationArray.map(operation => {
        return {
          suffixData: {
            deltaHash: operation.suffixData.deltaHash,
            recoveryCommitment: operation.suffixData.recoveryCommitment,
            type: operation.suffixData.type
          }
        };
      });
      if (createReferences.length > 0) {
        coreIndexFileModel.operations.create = createReferences;
      }
      const recoverReferences = recoverOperationArray.map(operation => {
        const revealValue = operation.revealValue;
        return { didSuffix: operation.didUniqueSuffix, revealValue };
      });
      if (recoverReferences.length > 0) {
        coreIndexFileModel.operations.recover = recoverReferences;
      }
      const deactivateReferences = deactivateOperationArray.map(operation => {
        const revealValue = operation.revealValue;
        return { didSuffix: operation.didUniqueSuffix, revealValue };
      });
      if (deactivateReferences.length > 0) {
        coreIndexFileModel.operations.deactivate = deactivateReferences;
      }
      if (coreProofFileUri !== undefined) {
        coreIndexFileModel.coreProofFileUri = coreProofFileUri;
      }
      return coreIndexFileModel;
    });
  }

  static createBuffer (writerLockId, provisionalIndexFileUri, coreProofFileUri, createOperations, recoverOperations, deactivateOperations) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const coreIndexFileModel = yield CoreIndexFile.createModel(writerLockId, provisionalIndexFileUri, coreProofFileUri, createOperations, recoverOperations, deactivateOperations);
      const coreIndexFileJson = JSON.stringify(coreIndexFileModel);
      const coreIndexFileBuffer = Buffer.from(coreIndexFileJson);
      return Compressor_1.default.compress(coreIndexFileBuffer);
    });
  }

  static validateWriterLockId (writerLockId) {
    const writerLockIdSizeInBytes = Buffer.from(writerLockId).length;
    if (writerLockIdSizeInBytes > ProtocolParameters_1.default.maxWriterLockIdInBytes) {
      throw new SidetreeError_1.default(ErrorCode_1.default.CoreIndexFileWriterLockIdExceededMaxSize, `Writer lock ID of ${writerLockIdSizeInBytes} bytes exceeded the maximum size of ${ProtocolParameters_1.default.maxWriterLockIdInBytes} bytes.`);
    }
  }

  static validateCreateReferences (operationReferences) {
    for (const operationReference of operationReferences) {
      InputValidator_1.default.validateObjectContainsOnlyAllowedProperties(operationReference, ['suffixData'], `create operation reference`);
      InputValidator_1.default.validateSuffixData(operationReference.suffixData);
    }
  }
}
exports.default = CoreIndexFile;
// # sourceMappingURL=CoreIndexFile.js.map
