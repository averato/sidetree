'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const CoreIndexFile_1 = require('../../lib/core/versions/latest/CoreIndexFile');
const CoreProofFile_1 = require('../../lib/core/versions/latest/CoreProofFile');
const OperationGenerator_1 = require('./OperationGenerator');
const ProvisionalIndexFile_1 = require('../../lib/core/versions/latest/ProvisionalIndexFile');
const ProvisionalProofFile_1 = require('../../lib/core/versions/latest/ProvisionalProofFile');
class FileGenerator {
  static generateCoreIndexFile () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const createOperationData = yield OperationGenerator_1.default.generateCreateOperation();
      const provisionalIndexFileUri = OperationGenerator_1.default.generateRandomHash();
      const coreProofFileUri = undefined;
      const coreIndexFileBuffer = yield CoreIndexFile_1.default.createBuffer('writerLockId', provisionalIndexFileUri, coreProofFileUri, [createOperationData.createOperation], [], []);
      const coreIndexFile = yield CoreIndexFile_1.default.parse(coreIndexFileBuffer);
      return coreIndexFile;
    });
  }

  static generateProvisionalIndexFile () {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const updateRequestData = yield OperationGenerator_1.default.generateUpdateOperationRequest();
      const chunkFileUri = OperationGenerator_1.default.generateRandomHash();
      const provisionalProofFileUri = OperationGenerator_1.default.generateRandomHash();
      const provisionalIndexFileBuffer = yield ProvisionalIndexFile_1.default.createBuffer(chunkFileUri, provisionalProofFileUri, [updateRequestData.updateOperation]);
      const provisionalIndexFile = yield ProvisionalIndexFile_1.default.parse(provisionalIndexFileBuffer);
      return provisionalIndexFile;
    });
  }

  static createCoreProofFile (recoverOperations, deactivateOperations) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const deactivatedDidUniqueSuffixes = deactivateOperations.map(operation => operation.didUniqueSuffix);
      const coreProofFileBuffer = yield CoreProofFile_1.default.createBuffer(recoverOperations, deactivateOperations);
      if (coreProofFileBuffer === undefined) {
        return undefined;
      }
      const coreProofFile = yield CoreProofFile_1.default.parse(coreProofFileBuffer, deactivatedDidUniqueSuffixes);
      return coreProofFile;
    });
  }

  static createProvisionalProofFile (updateOperations) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      const provisionalProofFileBuffer = yield ProvisionalProofFile_1.default.createBuffer(updateOperations);
      if (provisionalProofFileBuffer === undefined) {
        return undefined;
      }
      const provisionalProofFile = yield ProvisionalProofFile_1.default.parse(provisionalProofFileBuffer);
      return provisionalProofFile;
    });
  }
}
exports.default = FileGenerator;
// # sourceMappingURL=FileGenerator.js.map
