'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const fs = require('fs');
const Jwk_1 = require('../../lib/core/versions/latest/util/Jwk');
const Multihash_1 = require('../../lib/core/versions/latest/Multihash');
const OperationGenerator_1 = require('./OperationGenerator');
class VegetaLoadGenerator {
  static generateLoadFiles (uniqueDidCount, endpointUrl, absoluteFolderPath) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      fs.mkdirSync(absoluteFolderPath);
      fs.mkdirSync(absoluteFolderPath + '/keys');
      fs.mkdirSync(absoluteFolderPath + '/requests');
      for (let i = 0; i < uniqueDidCount; i++) {
        const createOperationData = yield OperationGenerator_1.default.generateCreateOperation();
        fs.writeFileSync(absoluteFolderPath + `/keys/recoveryPrivateKey${i}.json`, JSON.stringify(createOperationData.recoveryPrivateKey));
        fs.writeFileSync(absoluteFolderPath + `/keys/recoveryPublicKey${i}.json`, JSON.stringify(createOperationData.recoveryPublicKey));
        fs.writeFileSync(absoluteFolderPath + `/keys/updatePrivateKey${i}.json`, JSON.stringify(createOperationData.updatePrivateKey));
        fs.writeFileSync(absoluteFolderPath + `/keys/updatePublicKey${i}.json`, JSON.stringify(createOperationData.updatePublicKey));
        fs.writeFileSync(absoluteFolderPath + `/keys/signingPrivateKey${i}.json`, JSON.stringify(createOperationData.signingPrivateKey));
        fs.writeFileSync(absoluteFolderPath + `/keys/signingPublicKey${i}.json`, JSON.stringify(createOperationData.signingPublicKey));
        fs.writeFileSync(absoluteFolderPath + `/requests/create${i}.json`, createOperationData.createOperation.operationBuffer);
        const [newUpdatePublicKey] = yield Jwk_1.default.generateEs256kKeyPair();
        const newUpdateCommitmentHash = Multihash_1.default.canonicalizeThenDoubleHashThenEncode(newUpdatePublicKey);
        const [additionalKey] = yield OperationGenerator_1.default.generateKeyPair(`additionalKey`);
        const updateOperationRequest = yield OperationGenerator_1.default.createUpdateOperationRequestForAddingAKey(createOperationData.createOperation.didUniqueSuffix, createOperationData.updatePublicKey, createOperationData.updatePrivateKey, additionalKey, newUpdateCommitmentHash);
        const updateOperationBuffer = Buffer.from(JSON.stringify(updateOperationRequest));
        fs.writeFileSync(absoluteFolderPath + `/requests/update${i}.json`, updateOperationBuffer);
        const [newRecoveryPublicKey] = yield Jwk_1.default.generateEs256kKeyPair();
        const [newSigningPublicKey] = yield OperationGenerator_1.default.generateKeyPair('newSigningKey');
        const recoverOperationRequest = yield OperationGenerator_1.default.generateRecoverOperationRequest(createOperationData.createOperation.didUniqueSuffix, createOperationData.recoveryPrivateKey, newRecoveryPublicKey, newSigningPublicKey, OperationGenerator_1.default.generateServices(['newDummyEndpoint']), [newSigningPublicKey]);
        const recoverOperationBuffer = Buffer.from(JSON.stringify(recoverOperationRequest));
        fs.writeFileSync(`${absoluteFolderPath}/requests/recovery${i}.json`, recoverOperationBuffer);
        const deactivateOperationRequest = yield OperationGenerator_1.default.createDeactivateOperationRequest(createOperationData.createOperation.didUniqueSuffix, createOperationData.recoveryPrivateKey);
        const deactivateOperationBuffer = Buffer.from(JSON.stringify(deactivateOperationRequest));
        fs.writeFileSync(`${absoluteFolderPath}/requests/deactivate${i}.json`, deactivateOperationBuffer);
      }
      const operationsUrl = new URL('operations', endpointUrl).toString();
      let createTargetsFileString = '';
      for (let i = 0; i < uniqueDidCount; i++) {
        createTargetsFileString += `POST ${operationsUrl}\n`;
        createTargetsFileString += `@${absoluteFolderPath}/requests/create${i}.json\n\n`;
      }
      fs.writeFileSync(absoluteFolderPath + '/createTargets.txt', createTargetsFileString);
      let updateTargetsFileString = '';
      for (let i = 0; i < uniqueDidCount; i++) {
        updateTargetsFileString += `POST ${operationsUrl}\n`;
        updateTargetsFileString += `@${absoluteFolderPath}/requests/update${i}.json\n\n`;
      }
      fs.writeFileSync(absoluteFolderPath + '/updateTargets.txt', updateTargetsFileString);
      let recoveryTargetsFileString = '';
      for (let i = 0; i < uniqueDidCount; i++) {
        recoveryTargetsFileString += `POST ${operationsUrl}\n`;
        recoveryTargetsFileString += `@${absoluteFolderPath}/requests/recovery${i}.json\n\n`;
      }
      fs.writeFileSync(absoluteFolderPath + '/recoveryTargets.txt', recoveryTargetsFileString);
      let deactivateTargetsFileString = '';
      for (let i = 0; i < uniqueDidCount; i++) {
        deactivateTargetsFileString += `POST ${operationsUrl}\n`;
        deactivateTargetsFileString += `@${absoluteFolderPath}/requests/deactivate${i}.json\n\n`;
      }
      fs.writeFileSync(absoluteFolderPath + '/deactivateTargets.txt', deactivateTargetsFileString);
    });
  }
}
exports.default = VegetaLoadGenerator;
// # sourceMappingURL=VegetaLoadGenerator.js.map
