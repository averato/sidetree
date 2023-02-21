"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto = require("crypto");
const AnchoredDataSerializer_1 = require("../../lib/core/versions/latest/AnchoredDataSerializer");
const CoreIndexFile_1 = require("../../lib/core/versions/latest/CoreIndexFile");
const CreateOperation_1 = require("../../lib/core/versions/latest/CreateOperation");
const DataGenerator_1 = require("./DataGenerator");
const DeactivateOperation_1 = require("../../lib/core/versions/latest/DeactivateOperation");
const Did_1 = require("../../lib/core/versions/latest/Did");
const Encoder_1 = require("../../lib/core/versions/latest/Encoder");
const JsonCanonicalizer_1 = require("../../lib/core/versions/latest/util/JsonCanonicalizer");
const Jwk_1 = require("../../lib/core/versions/latest/util/Jwk");
const Jws_1 = require("../../lib/core/versions/latest/util/Jws");
const Multihash_1 = require("../../lib/core/versions/latest/Multihash");
const OperationType_1 = require("../../lib/core/enums/OperationType");
const PatchAction_1 = require("../../lib/core/versions/latest/PatchAction");
const PublicKeyPurpose_1 = require("../../lib/core/versions/latest/PublicKeyPurpose");
const RecoverOperation_1 = require("../../lib/core/versions/latest/RecoverOperation");
const UpdateOperation_1 = require("../../lib/core/versions/latest/UpdateOperation");
class OperationGenerator {
    static generateTransactionModel() {
        const anchorString = AnchoredDataSerializer_1.default.serialize({ coreIndexFileUri: OperationGenerator.generateRandomHash(), numberOfOperations: 1 });
        return {
            anchorString,
            normalizedTransactionFee: DataGenerator_1.default.generateInteger(),
            transactionFeePaid: DataGenerator_1.default.generateInteger(),
            transactionNumber: DataGenerator_1.default.generateInteger(),
            transactionTime: DataGenerator_1.default.generateInteger(),
            transactionTimeHash: OperationGenerator.generateRandomHash(),
            writer: OperationGenerator.generateRandomHash()
        };
    }
    static generateRandomHash() {
        const randomBuffer = crypto.randomBytes(32);
        const hashAlgorithmInMultihashCode = 18;
        const randomHash = Encoder_1.default.encode(Multihash_1.default.hash(randomBuffer, hashAlgorithmInMultihashCode));
        return randomHash;
    }
    static generateKeyPair(id, purposes) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const [publicKey, privateKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const publicKeyModel = {
                id,
                type: 'EcdsaSecp256k1VerificationKey2019',
                publicKeyJwk: publicKey,
                purposes: purposes || Object.values(PublicKeyPurpose_1.default)
            };
            return [publicKeyModel, privateKey];
        });
    }
    static generateAnchoredCreateOperation(input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const createOperationData = yield OperationGenerator.generateCreateOperation();
            const anchoredOperationModel = {
                type: OperationType_1.default.Create,
                didUniqueSuffix: createOperationData.createOperation.didUniqueSuffix,
                operationBuffer: createOperationData.createOperation.operationBuffer,
                transactionNumber: input.transactionNumber,
                transactionTime: input.transactionTime,
                operationIndex: input.operationIndex
            };
            return {
                createOperation: createOperationData.createOperation,
                operationRequest: createOperationData.operationRequest,
                anchoredOperationModel,
                recoveryPublicKey: createOperationData.recoveryPublicKey,
                recoveryPrivateKey: createOperationData.recoveryPrivateKey,
                updatePublicKey: createOperationData.updatePublicKey,
                updatePrivateKey: createOperationData.updatePrivateKey,
                signingPublicKey: createOperationData.signingPublicKey,
                signingPrivateKey: createOperationData.signingPrivateKey
            };
        });
    }
    static generateLongFormDid(otherPublicKeys, services, network) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const document = {
                publicKeys: otherPublicKeys || [],
                services: services || []
            };
            const patches = [{
                    action: PatchAction_1.default.Replace,
                    document
                }];
            const [recoveryPublicKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const [updatePublicKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const delta = {
                updateCommitment: Multihash_1.default.canonicalizeThenDoubleHashThenEncode(updatePublicKey),
                patches
            };
            const deltaHash = Multihash_1.default.canonicalizeThenHashThenEncode(delta);
            const suffixData = {
                deltaHash: deltaHash,
                recoveryCommitment: Multihash_1.default.canonicalizeThenDoubleHashThenEncode(recoveryPublicKey)
            };
            const didUniqueSuffix = Did_1.default['computeUniqueSuffix'](suffixData);
            const shortFormDid = network ? `did:sidetree:${network}:${didUniqueSuffix}` : `did:sidetree:${didUniqueSuffix}`;
            const initialState = {
                suffixData: suffixData,
                delta: delta
            };
            const canonicalizedInitialStateBuffer = JsonCanonicalizer_1.default.canonicalizeAsBuffer(initialState);
            const encodedCanonicalizedInitialStateString = Encoder_1.default.encode(canonicalizedInitialStateBuffer);
            const longFormDid = `${shortFormDid}:${encodedCanonicalizedInitialStateString}`;
            return {
                longFormDid,
                shortFormDid,
                didUniqueSuffix
            };
        });
    }
    static createDid(recoveryKey, updateKey, patches, network) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const delta = {
                updateCommitment: Multihash_1.default.canonicalizeThenDoubleHashThenEncode(updateKey),
                patches
            };
            const deltaHash = Multihash_1.default.canonicalizeThenHashThenEncode(delta);
            const suffixData = {
                deltaHash: deltaHash,
                recoveryCommitment: Multihash_1.default.canonicalizeThenDoubleHashThenEncode(recoveryKey)
            };
            const didUniqueSuffix = Did_1.default['computeUniqueSuffix'](suffixData);
            const shortFormDid = network ? `did:sidetree:${network}:${didUniqueSuffix}` : `did:sidetree:${didUniqueSuffix}`;
            const initialState = {
                suffixData: suffixData,
                delta: delta
            };
            const canonicalizedInitialStateBuffer = JsonCanonicalizer_1.default.canonicalizeAsBuffer(initialState);
            const encodedCanonicalizedInitialStateString = Encoder_1.default.encode(canonicalizedInitialStateBuffer);
            const longFormDid = `${shortFormDid}:${encodedCanonicalizedInitialStateString}`;
            return {
                longFormDid,
                shortFormDid,
                didUniqueSuffix
            };
        });
    }
    static generateCreateOperation() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const signingKeyId = 'signingKey';
            const [recoveryPublicKey, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const [updatePublicKey, updatePrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const [signingPublicKey, signingPrivateKey] = yield OperationGenerator.generateKeyPair(signingKeyId);
            const services = OperationGenerator.generateServices(['serviceId123']);
            const operationRequest = yield OperationGenerator.createCreateOperationRequest(recoveryPublicKey, updatePublicKey, [signingPublicKey], services);
            const operationBuffer = Buffer.from(JSON.stringify(operationRequest));
            const createOperation = yield CreateOperation_1.default.parse(operationBuffer);
            return {
                createOperation,
                operationRequest,
                recoveryPublicKey,
                recoveryPrivateKey,
                updatePublicKey,
                updatePrivateKey,
                signingPublicKey,
                signingPrivateKey
            };
        });
    }
    static generateRecoverOperation(input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const newSigningKeyId = 'newSigningKey';
            const [newRecoveryPublicKey, newRecoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
            const [newSigningPublicKey, newSigningPrivateKey] = yield OperationGenerator.generateKeyPair(newSigningKeyId);
            const [publicKeyToBeInDocument] = yield OperationGenerator.generateKeyPair('newKey');
            const services = OperationGenerator.generateServices(['serviceId123']);
            const [updateKey, updatePrivateKey] = yield OperationGenerator.generateKeyPair('updateKey');
            const operationJson = yield OperationGenerator.generateRecoverOperationRequest(input.didUniqueSuffix, input.recoveryPrivateKey, newRecoveryPublicKey, newSigningPublicKey, services, [publicKeyToBeInDocument]);
            const operationBuffer = Buffer.from(JSON.stringify(operationJson));
            const recoverOperation = yield RecoverOperation_1.default.parse(operationBuffer);
            return {
                recoverOperation,
                operationBuffer,
                recoveryPublicKey: newRecoveryPublicKey,
                recoveryPrivateKey: newRecoveryPrivateKey,
                signingPublicKey: newSigningPublicKey,
                signingPrivateKey: newSigningPrivateKey,
                updateKey,
                updatePrivateKey
            };
        });
    }
    static generateUpdateOperation(didUniqueSuffix, updatePublicKey, updatePrivateKey, multihashAlgorithmCodeToUse, multihashAlgorithmForRevealValue) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const additionalKeyId = `additional-key`;
            const [additionalPublicKey, additionalPrivateKey] = yield OperationGenerator.generateKeyPair(additionalKeyId);
            const nextUpdateCommitmentHash = Multihash_1.default.canonicalizeThenDoubleHashThenEncode(additionalPublicKey.publicKeyJwk);
            const operationJson = yield OperationGenerator.createUpdateOperationRequestForAddingAKey(didUniqueSuffix, updatePublicKey, updatePrivateKey, additionalPublicKey, nextUpdateCommitmentHash, multihashAlgorithmCodeToUse, multihashAlgorithmForRevealValue);
            const operationBuffer = Buffer.from(JSON.stringify(operationJson));
            const updateOperation = yield UpdateOperation_1.default.parse(operationBuffer);
            return {
                updateOperation,
                operationBuffer,
                additionalKeyId,
                additionalPublicKey,
                additionalPrivateKey,
                nextUpdateKey: additionalPublicKey.publicKeyJwk
            };
        });
    }
    static createAnchoredOperationModelFromOperationModel(operationModel, transactionTime, transactionNumber, operationIndex) {
        const anchoredOperationModel = {
            didUniqueSuffix: operationModel.didUniqueSuffix,
            type: operationModel.type,
            operationBuffer: operationModel.operationBuffer,
            operationIndex,
            transactionNumber,
            transactionTime
        };
        return anchoredOperationModel;
    }
    static createAnchoredOperationModelFromRequest(didUniqueSuffix, operationRequest, transactionTime, transactionNumber, operationIndex) {
        const operationBuffer = Buffer.from(JSON.stringify(operationRequest));
        const anchoredOperationModel = {
            didUniqueSuffix,
            type: operationRequest.type,
            operationBuffer,
            operationIndex,
            transactionNumber,
            transactionTime
        };
        return anchoredOperationModel;
    }
    static createCreateOperationRequest(recoveryPublicKey, updatePublicKey, otherPublicKeys, services) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const document = {
                publicKeys: otherPublicKeys,
                services
            };
            const patches = [{
                    action: PatchAction_1.default.Replace,
                    document
                }];
            const delta = {
                updateCommitment: Multihash_1.default.canonicalizeThenDoubleHashThenEncode(updatePublicKey),
                patches
            };
            const deltaHash = Multihash_1.default.canonicalizeThenHashThenEncode(delta);
            const suffixData = {
                deltaHash,
                recoveryCommitment: Multihash_1.default.canonicalizeThenDoubleHashThenEncode(recoveryPublicKey)
            };
            const operation = {
                type: OperationType_1.default.Create,
                suffixData,
                delta
            };
            return operation;
        });
    }
    static generateUpdateOperationRequest(didUniqueSuffix) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (didUniqueSuffix === undefined) {
                didUniqueSuffix = OperationGenerator.generateRandomHash();
            }
            const [nextUpdateKey] = yield OperationGenerator.generateKeyPair('nextUpdateKey');
            const nextUpdateCommitmentHash = Multihash_1.default.canonicalizeThenDoubleHashThenEncode(nextUpdateKey.publicKeyJwk);
            const anyNewSigningPublicKeyId = 'anyNewKey';
            const [anyNewSigningKey] = yield OperationGenerator.generateKeyPair(anyNewSigningPublicKeyId);
            const patches = [
                {
                    action: PatchAction_1.default.AddPublicKeys,
                    publicKeys: [
                        anyNewSigningKey
                    ]
                }
            ];
            const signingKeyId = 'anySigningKeyId';
            const [signingPublicKey, signingPrivateKey] = yield OperationGenerator.generateKeyPair(signingKeyId);
            const request = yield OperationGenerator.createUpdateOperationRequest(didUniqueSuffix, signingPublicKey.publicKeyJwk, signingPrivateKey, nextUpdateCommitmentHash, patches);
            const buffer = Buffer.from(JSON.stringify(request));
            const updateOperation = yield UpdateOperation_1.default.parse(buffer);
            return {
                request,
                buffer,
                updateOperation
            };
        });
    }
    static createUpdateOperationRequest(didSuffix, updatePublicKey, updatePrivateKey, nextUpdateCommitmentHash, patches, multihashAlgorithmCodeToUse, multihashAlgorithmForRevealValue) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const revealValue = Multihash_1.default.canonicalizeThenHashThenEncode(updatePublicKey, multihashAlgorithmForRevealValue);
            const delta = {
                patches,
                updateCommitment: nextUpdateCommitmentHash
            };
            const deltaHash = Multihash_1.default.canonicalizeThenHashThenEncode(delta, multihashAlgorithmCodeToUse);
            const signedDataPayloadObject = {
                updateKey: updatePublicKey,
                deltaHash: deltaHash
            };
            const signedData = yield OperationGenerator.signUsingEs256k(signedDataPayloadObject, updatePrivateKey);
            const updateOperationRequest = {
                type: OperationType_1.default.Update,
                didSuffix,
                revealValue,
                delta,
                signedData
            };
            return updateOperationRequest;
        });
    }
    static generateRecoverOperationRequest(didUniqueSuffix, recoveryPrivateKey, newRecoveryPublicKey, newSigningPublicKey, services, publicKeys) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const document = {
                publicKeys: publicKeys,
                services
            };
            const recoverOperation = yield OperationGenerator.createRecoverOperationRequest(didUniqueSuffix, recoveryPrivateKey, newRecoveryPublicKey, Multihash_1.default.canonicalizeThenDoubleHashThenEncode(newSigningPublicKey.publicKeyJwk), document);
            return recoverOperation;
        });
    }
    static createRecoverOperationRequest(didSuffix, recoveryPrivateKey, newRecoveryPublicKey, nextUpdateCommitmentHash, document) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const recoveryPublicKey = Jwk_1.default.getEs256kPublicKey(recoveryPrivateKey);
            const revealValue = Multihash_1.default.canonicalizeThenHashThenEncode(recoveryPublicKey);
            const patches = [{
                    action: PatchAction_1.default.Replace,
                    document
                }];
            const delta = {
                patches,
                updateCommitment: nextUpdateCommitmentHash
            };
            const deltaHash = Multihash_1.default.canonicalizeThenHashThenEncode(delta);
            const signedDataPayloadObject = {
                deltaHash,
                recoveryKey: recoveryPublicKey,
                recoveryCommitment: Multihash_1.default.canonicalizeThenDoubleHashThenEncode(newRecoveryPublicKey)
            };
            const signedData = yield OperationGenerator.signUsingEs256k(signedDataPayloadObject, recoveryPrivateKey);
            const operation = {
                type: OperationType_1.default.Recover,
                didSuffix,
                revealValue,
                signedData,
                delta
            };
            return operation;
        });
    }
    static createDeactivateOperationRequest(didSuffix, recoveryPrivateKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const recoveryPublicKey = Jwk_1.default.getEs256kPublicKey(recoveryPrivateKey);
            const revealValue = Multihash_1.default.canonicalizeThenHashThenEncode(recoveryPublicKey);
            const signedDataPayloadObject = {
                didSuffix,
                recoveryKey: recoveryPublicKey
            };
            const signedData = yield OperationGenerator.signUsingEs256k(signedDataPayloadObject, recoveryPrivateKey);
            const operation = {
                type: OperationType_1.default.Deactivate,
                didSuffix,
                revealValue,
                signedData
            };
            return operation;
        });
    }
    static generateCreateOperationBuffer(recoveryPublicKey, signingPublicKey, services) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const operation = yield OperationGenerator.createCreateOperationRequest(recoveryPublicKey, signingPublicKey.publicKeyJwk, [signingPublicKey], services);
            return Buffer.from(JSON.stringify(operation));
        });
    }
    static createUpdateOperationRequestForAddingAKey(didUniqueSuffix, updatePublicKey, updatePrivateKey, newPublicKey, nextUpdateCommitmentHash, multihashAlgorithmCodeToUse, multihashAlgorithmForRevealValue) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const patches = [
                {
                    action: PatchAction_1.default.AddPublicKeys,
                    publicKeys: [
                        newPublicKey
                    ]
                }
            ];
            const updateOperationRequest = yield OperationGenerator.createUpdateOperationRequest(didUniqueSuffix, updatePublicKey, updatePrivateKey, nextUpdateCommitmentHash, patches, multihashAlgorithmCodeToUse, multihashAlgorithmForRevealValue);
            return updateOperationRequest;
        });
    }
    static generateUpdateOperationRequestForServices(didUniqueSuffix, updatePublicKey, updatePrivateKey, nextUpdateCommitmentHash, idOfServiceEndpointToAdd, idsOfServiceEndpointToRemove) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const patches = [];
            if (idOfServiceEndpointToAdd !== undefined) {
                const patch = {
                    action: PatchAction_1.default.AddServices,
                    services: OperationGenerator.generateServices([idOfServiceEndpointToAdd])
                };
                patches.push(patch);
            }
            if (idsOfServiceEndpointToRemove.length > 0) {
                const patch = {
                    action: PatchAction_1.default.RemoveServices,
                    ids: idsOfServiceEndpointToRemove
                };
                patches.push(patch);
            }
            const updateOperationRequest = yield OperationGenerator.createUpdateOperationRequest(didUniqueSuffix, updatePublicKey, updatePrivateKey, nextUpdateCommitmentHash, patches);
            return updateOperationRequest;
        });
    }
    static signUsingEs256k(payload, privateKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const protectedHeader = {
                alg: 'ES256K'
            };
            const compactJws = Jws_1.default.signAsCompactJws(payload, privateKey, protectedHeader);
            return compactJws;
        });
    }
    static createDeactivateOperation(didUniqueSuffix, recoveryPrivateKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const operationRequest = yield OperationGenerator.createDeactivateOperationRequest(didUniqueSuffix, recoveryPrivateKey);
            const operationBuffer = Buffer.from(JSON.stringify(operationRequest));
            const deactivateOperation = yield DeactivateOperation_1.default.parse(operationBuffer);
            return {
                operationRequest,
                operationBuffer,
                deactivateOperation
            };
        });
    }
    static generateServices(ids) {
        const services = [];
        for (const id of ids) {
            services.push({
                id: id,
                type: 'someType',
                serviceEndpoint: 'https://www.url.com'
            });
        }
        return services;
    }
    static generateCoreIndexFile(recoveryOperationCount) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const provisionalIndexFileUri = 'bafkreid5uh2g5gbbhvpza4mwfwbmigy43rar2xkalwtvc7v34b4557cr2i';
            const coreProofFileUri = 'bafkreid5uh2g5gbbhvpza4mwfwbmigy43rar2xkalwtvc7v34b4557aaaa';
            const recoverOperations = [];
            for (let i = 0; i < recoveryOperationCount; i++) {
                const [, anyRecoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
                const anyDid = OperationGenerator.generateRandomHash();
                const recoverOperationData = yield OperationGenerator.generateRecoverOperation({ didUniqueSuffix: anyDid, recoveryPrivateKey: anyRecoveryPrivateKey });
                const recoverOperation = recoverOperationData.recoverOperation;
                recoverOperations.push(recoverOperation);
            }
            const coreIndexFileBuffer = yield CoreIndexFile_1.default.createBuffer(undefined, provisionalIndexFileUri, coreProofFileUri, [], recoverOperations, []);
            return coreIndexFileBuffer;
        });
    }
}
exports.default = OperationGenerator;
//# sourceMappingURL=OperationGenerator.js.map