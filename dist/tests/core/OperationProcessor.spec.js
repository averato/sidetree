'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const CreateOperation_1 = require('../../lib/core/versions/latest/CreateOperation');
const DeactivateOperation_1 = require('../../lib/core/versions/latest/DeactivateOperation');
const Document_1 = require('../utils/Document');
const DocumentComposer_1 = require('../../lib/core/versions/latest/DocumentComposer');
const ErrorCode_1 = require('../../lib/core/versions/latest/ErrorCode');
const JsObject_1 = require('../../lib/core/versions/latest/util/JsObject');
const Jwk_1 = require('../../lib/core/versions/latest/util/Jwk');
const MockOperationStore_1 = require('../mocks/MockOperationStore');
const MockVersionManager_1 = require('../mocks/MockVersionManager');
const Multihash_1 = require('../../lib/core/versions/latest/Multihash');
const OperationGenerator_1 = require('../generators/OperationGenerator');
const OperationProcessor_1 = require('../../lib/core/versions/latest/OperationProcessor');
const OperationType_1 = require('../../lib/core/enums/OperationType');
const PatchAction_1 = require('../../lib/core/versions/latest/PatchAction');
const RecoverOperation_1 = require('../../lib/core/versions/latest/RecoverOperation');
const Resolver_1 = require('../../lib/core/Resolver');
const SidetreeError_1 = require('../../lib/common/SidetreeError');
const UpdateOperation_1 = require('../../lib/core/versions/latest/UpdateOperation');
function createUpdateSequence (didUniqueSuffix, createOp, numberOfUpdates, privateKey) {
  return tslib_1.__awaiter(this, void 0, void 0, function * () {
    const ops = new Array(createOp);
    let currentUpdateKey = Jwk_1.default.getEs256kPublicKey(privateKey);
    let currentPrivateKey = privateKey;
    for (let i = 0; i < numberOfUpdates; ++i) {
      const [nextUpdateKey, nextPrivateKey] = yield OperationGenerator_1.default.generateKeyPair('updateKey');
      const nextUpdateCommitmentHash = Multihash_1.default.canonicalizeThenDoubleHashThenEncode(nextUpdateKey.publicKeyJwk);
      const patches = [
        {
          action: PatchAction_1.default.RemoveServices,
          ids: ['serviceId' + (i - 1)]
        },
        {
          action: PatchAction_1.default.AddServices,
          services: OperationGenerator_1.default.generateServices(['serviceId' + i])
        }
      ];
      const updateOperationRequest = yield OperationGenerator_1.default.createUpdateOperationRequest(didUniqueSuffix, currentUpdateKey, currentPrivateKey, nextUpdateCommitmentHash, patches);
      currentUpdateKey = nextUpdateKey.publicKeyJwk;
      currentPrivateKey = nextPrivateKey;
      const operationBuffer = Buffer.from(JSON.stringify(updateOperationRequest));
      const updateOp = {
        type: OperationType_1.default.Update,
        didUniqueSuffix,
        operationBuffer,
        transactionTime: i + 1,
        transactionNumber: i + 1,
        operationIndex: 0
      };
      ops.push(updateOp);
    }
    return ops;
  });
}
function getFactorial (n) {
  let factorial = 1;
  for (let i = 2; i <= n; ++i) {
    factorial *= i;
  }
  return factorial;
}
function getPermutation (size, index) {
  const permutation = [];
  for (let i = 0; i < size; ++i) {
    permutation.push(i);
  }
  for (let i = 0; i < size; ++i) {
    const j = i + Math.floor(index / getFactorial(size - i - 1));
    index = index % getFactorial(size - i - 1);
    const t = permutation[i];
    permutation[i] = permutation[j];
    permutation[j] = t;
  }
  return permutation;
}
function validateDocumentAfterUpdates (document, numberOfUpdates) {
  expect(document).toBeDefined();
  expect(document.services[0].id).toEqual('serviceId' + (numberOfUpdates - 1));
}
describe('OperationProcessor', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
  let resolver;
  let operationStore;
  let versionManager;
  let operationProcessor;
  let createOp;
  let recoveryPublicKey;
  let recoveryPrivateKey;
  let signingKeyId;
  let signingPublicKey;
  let signingPrivateKey;
  let didUniqueSuffix;
  beforeEach(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    operationStore = new MockOperationStore_1.default();
    operationProcessor = new OperationProcessor_1.default();
    versionManager = new MockVersionManager_1.default();
    spyOn(versionManager, 'getOperationProcessor').and.returnValue(operationProcessor);
    resolver = new Resolver_1.default(versionManager, operationStore);
    signingKeyId = 'signingKey';
    [recoveryPublicKey, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
    [signingPublicKey, signingPrivateKey] = yield OperationGenerator_1.default.generateKeyPair(signingKeyId);
    const services = OperationGenerator_1.default.generateServices(['serviceId0']);
    const createOperationBuffer = yield OperationGenerator_1.default.generateCreateOperationBuffer(recoveryPublicKey, signingPublicKey, services);
    const createOperation = yield CreateOperation_1.default.parse(createOperationBuffer);
    createOp = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(createOperation, 0, 0, 0);
    didUniqueSuffix = createOp.didUniqueSuffix;
  }));
  it('should return a DID Document for resolve(did) for a registered DID', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    yield operationStore.insertOrReplace([createOp]);
    const didState = yield resolver.resolve(didUniqueSuffix);
    expect(didState).toBeDefined();
    const document = didState.document;
    const signingKey = Document_1.default.getPublicKey(document, signingKeyId);
    expect(signingKey).toBeDefined();
  }));
  it('should ignore a duplicate create operation', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    yield operationStore.insertOrReplace([createOp]);
    const duplicateOperation = yield CreateOperation_1.default.parse(createOp.operationBuffer);
    const duplicateNamedAnchoredCreateOperationModel = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(duplicateOperation, 1, 1, 0);
    yield operationStore.insertOrReplace([duplicateNamedAnchoredCreateOperationModel]);
    const didState = yield resolver.resolve(didUniqueSuffix);
    expect(didState).toBeDefined();
    const document = didState.document;
    const signingKey = Document_1.default.getPublicKey(document, signingKeyId);
    expect(signingKey).toBeDefined();
  }));
  it('should process update to remove a public key correctly', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    yield operationStore.insertOrReplace([createOp]);
    const patches = [
      {
        action: PatchAction_1.default.RemovePublicKeys,
        ids: [signingKeyId]
      }
    ];
    const nextUpdateCommitmentHash = 'EiD_UnusedNextUpdateCommitmentHash_AAAAAAAAAAA';
    const updateOperationRequest = yield OperationGenerator_1.default.createUpdateOperationRequest(didUniqueSuffix, signingPublicKey.publicKeyJwk, signingPrivateKey, nextUpdateCommitmentHash, patches);
    const operationBuffer = Buffer.from(JSON.stringify(updateOperationRequest));
    const updateOp = {
      type: OperationType_1.default.Update,
      didUniqueSuffix,
      operationBuffer,
      transactionTime: 1,
      transactionNumber: 1,
      operationIndex: 0
    };
    yield operationStore.insertOrReplace([updateOp]);
    const didState = yield resolver.resolve(didUniqueSuffix);
    expect(didState).toBeDefined();
    const document = didState.document;
    const signingKey = Document_1.default.getPublicKey(document, signingKeyId);
    expect(signingKey).not.toBeDefined();
  }));
  it('should process updates correctly', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const numberOfUpdates = 10;
    const ops = yield createUpdateSequence(didUniqueSuffix, createOp, numberOfUpdates, signingPrivateKey);
    yield operationStore.insertOrReplace(ops);
    const didState = yield resolver.resolve(didUniqueSuffix);
    expect(didState).toBeDefined();
    validateDocumentAfterUpdates(didState.document, numberOfUpdates);
  }));
  it('should correctly process updates in reverse order', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const numberOfUpdates = 10;
    const ops = yield createUpdateSequence(didUniqueSuffix, createOp, numberOfUpdates, signingPrivateKey);
    for (let i = numberOfUpdates; i >= 0; --i) {
      yield operationStore.insertOrReplace([ops[i]]);
    }
    const didState = yield resolver.resolve(didUniqueSuffix);
    expect(didState).toBeDefined();
    validateDocumentAfterUpdates(didState.document, numberOfUpdates);
  }));
  it('should correctly process updates in every (5! = 120) order', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const numberOfUpdates = 4;
    const ops = yield createUpdateSequence(didUniqueSuffix, createOp, numberOfUpdates, signingPrivateKey);
    const numberOfOps = ops.length;
    const numberOfPermutations = getFactorial(numberOfOps);
    for (let i = 0; i < numberOfPermutations; ++i) {
      const permutation = getPermutation(numberOfOps, i);
      operationStore = new MockOperationStore_1.default();
      resolver = new Resolver_1.default(versionManager, operationStore);
      const permutedOps = permutation.map(i => ops[i]);
      yield operationStore.insertOrReplace(permutedOps);
      const didState = yield resolver.resolve(didUniqueSuffix);
      expect(didState).toBeDefined();
      validateDocumentAfterUpdates(didState.document, numberOfUpdates);
    }
  }));
  it('should process deactivate operation correctly.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const numberOfUpdates = 10;
    const ops = yield createUpdateSequence(didUniqueSuffix, createOp, numberOfUpdates, signingPrivateKey);
    yield operationStore.insertOrReplace(ops);
    const didState = yield resolver.resolve(didUniqueSuffix);
    expect(didState).toBeDefined();
    validateDocumentAfterUpdates(didState.document, numberOfUpdates);
    const deactivateOperationData = yield OperationGenerator_1.default.createDeactivateOperation(didUniqueSuffix, recoveryPrivateKey);
    const anchoredDeactivateOperation = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(deactivateOperationData.deactivateOperation, numberOfUpdates + 1, numberOfUpdates + 1, 0);
    yield operationStore.insertOrReplace([anchoredDeactivateOperation]);
    const deactivatedDidState = yield resolver.resolve(didUniqueSuffix);
    expect(deactivatedDidState).toBeDefined();
    expect(deactivatedDidState.nextRecoveryCommitmentHash).toBeUndefined();
    expect(deactivatedDidState.nextUpdateCommitmentHash).toBeUndefined();
    expect(deactivatedDidState.lastOperationTransactionNumber).toEqual(numberOfUpdates + 1);
  }));
  it('should ignore a deactivate operation of a non-existent did', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const deactivateOperationData = yield OperationGenerator_1.default.createDeactivateOperation(didUniqueSuffix, recoveryPrivateKey);
    const anchoredDeactivateOperation = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(deactivateOperationData.deactivateOperation, 1, 1, 0);
    yield operationStore.insertOrReplace([anchoredDeactivateOperation]);
    const didDocumentAfterDeactivate = yield resolver.resolve(didUniqueSuffix);
    expect(didDocumentAfterDeactivate).toBeUndefined();
  }));
  it('should ignore a deactivate operation with invalid signature', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    yield operationStore.insertOrReplace([createOp]);
    const deactivateOperationData = yield OperationGenerator_1.default.createDeactivateOperation(didUniqueSuffix, signingPrivateKey);
    const anchoredDeactivateOperation = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(deactivateOperationData.deactivateOperation, 1, 1, 0);
    yield operationStore.insertOrReplace([anchoredDeactivateOperation]);
    const didState = yield resolver.resolve(didUniqueSuffix);
    expect(didState).toBeDefined();
    const document = didState.document;
    const signingKey = Document_1.default.getPublicKey(document, signingKeyId);
    expect(signingKey).toBeDefined();
  }));
  it('should ignore updates to DID that is not created', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const numberOfUpdates = 10;
    const ops = yield createUpdateSequence(didUniqueSuffix, createOp, numberOfUpdates, signingPrivateKey);
    for (let i = 1; i < ops.length; ++i) {
      yield operationStore.insertOrReplace([ops[i]]);
    }
    const didDocument = yield resolver.resolve(didUniqueSuffix);
    expect(didDocument).toBeUndefined();
  }));
  it('should ignore update operation with the incorrect updateKey', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    yield operationStore.insertOrReplace([createOp]);
    const [anyPublicKey] = yield OperationGenerator_1.default.generateKeyPair(`additionalKey`);
    const [invalidKey] = yield OperationGenerator_1.default.generateKeyPair('invalidKey');
    const updateOperationRequest = yield OperationGenerator_1.default.createUpdateOperationRequestForAddingAKey(didUniqueSuffix, invalidKey.publicKeyJwk, signingPrivateKey, anyPublicKey, OperationGenerator_1.default.generateRandomHash());
    const updateOperationBuffer = Buffer.from(JSON.stringify(updateOperationRequest));
    const updateOperation = yield UpdateOperation_1.default.parse(updateOperationBuffer);
    const anchoredUpdateOperation = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(updateOperation, 1, 1, 0);
    yield operationStore.insertOrReplace([anchoredUpdateOperation]);
    const didState = yield resolver.resolve(didUniqueSuffix);
    expect(didState).toBeDefined();
    const document = didState.document;
    const newKey = Document_1.default.getPublicKey(document, 'additionalKey');
    expect(newKey).not.toBeDefined();
  }));
  it('should ignore update operation with an invalid signature', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    yield operationStore.insertOrReplace([createOp]);
    const [, anyIncorrectSigningPrivateKey] = yield OperationGenerator_1.default.generateKeyPair('key1');
    const [anyPublicKey] = yield OperationGenerator_1.default.generateKeyPair(`additionalKey`);
    const updateOperationRequest = yield OperationGenerator_1.default.createUpdateOperationRequestForAddingAKey(didUniqueSuffix, signingPublicKey.publicKeyJwk, anyIncorrectSigningPrivateKey, anyPublicKey, OperationGenerator_1.default.generateRandomHash());
    const updateOperationBuffer = Buffer.from(JSON.stringify(updateOperationRequest));
    const updateOperation = yield UpdateOperation_1.default.parse(updateOperationBuffer);
    const anchoredUpdateOperation = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(updateOperation, 1, 1, 0);
    yield operationStore.insertOrReplace([anchoredUpdateOperation]);
    const didState = yield resolver.resolve(didUniqueSuffix);
    expect(didState).toBeDefined();
    const document = didState.document;
    const newKey = Document_1.default.getPublicKey(document, 'new-key');
    expect(newKey).not.toBeDefined();
  }));
  it('should resolve as undefined if all operation of a DID is rolled back.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
    const numberOfUpdates = 10;
    const ops = yield createUpdateSequence(didUniqueSuffix, createOp, numberOfUpdates, signingPrivateKey);
    yield operationStore.insertOrReplace(ops);
    const didState = yield resolver.resolve(didUniqueSuffix);
    expect(didState).toBeDefined();
    validateDocumentAfterUpdates(didState.document, numberOfUpdates);
    yield operationStore.delete();
    const didDocumentAfterRollback = yield resolver.resolve(didUniqueSuffix);
    expect(didDocumentAfterRollback).toBeUndefined();
  }));
  describe('apply()', () => {
    let recoveryPublicKey;
    let recoveryPrivateKey;
    let signingPublicKey;
    let signingPrivateKey;
    let namedAnchoredCreateOperationModel;
    let didState;
    let verifyEncodedMultihashForContentSpy;
    beforeEach(() => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      verifyEncodedMultihashForContentSpy = spyOn(Multihash_1.default, 'verifyEncodedMultihashForContent');
      verifyEncodedMultihashForContentSpy.and.callThrough();
      didState = undefined;
      [recoveryPublicKey, recoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
      [signingPublicKey, signingPrivateKey] = yield OperationGenerator_1.default.generateKeyPair('signingKey');
      const services = OperationGenerator_1.default.generateServices(['dummyHubUri']);
      const createOperationBuffer = yield OperationGenerator_1.default.generateCreateOperationBuffer(recoveryPublicKey, signingPublicKey, services);
      const createOperation = yield CreateOperation_1.default.parse(createOperationBuffer);
      namedAnchoredCreateOperationModel = {
        type: OperationType_1.default.Create,
        didUniqueSuffix: createOperation.didUniqueSuffix,
        operationBuffer: createOperationBuffer,
        transactionNumber: 1,
        transactionTime: 1,
        operationIndex: 1
      };
      didState = yield operationProcessor.apply(namedAnchoredCreateOperationModel, didState);
      expect(didState).toBeDefined();
      expect(didState.document).toBeDefined();
    }));
    it('should return `undefined` if operation of unknown type is given.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const anyDid = OperationGenerator_1.default.generateRandomHash();
      const [, anyRecoveryPrivateKey] = yield OperationGenerator_1.default.generateKeyPair('anyRecoveryKey');
      const deactivateOperationData = yield OperationGenerator_1.default.createDeactivateOperation(anyDid, anyRecoveryPrivateKey);
      const anchoredDeactivateOperation = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(deactivateOperationData.deactivateOperation, 1, 1, 1);
      const newDidState = yield operationProcessor.apply(anchoredDeactivateOperation, undefined);
      expect(newDidState).toBeUndefined();
    }));
    it('should throw if operation of unknown type is given.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 2, transactionNumber: 2, operationIndex: 2 });
      const anchoredOperationModel = createOperationData.anchoredOperationModel;
      anchoredOperationModel.type = 'UnknownType';
      yield expectAsync(operationProcessor.apply(createOperationData.anchoredOperationModel, didState))
        .toBeRejectedWith(new SidetreeError_1.default(ErrorCode_1.default.OperationProcessorUnknownOperationType));
    }));
    describe('applyCreateOperation()', () => {
      it('should not apply the create operation if a DID state already exists.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 2, transactionNumber: 2, operationIndex: 2 });
        const newDidState = yield operationProcessor.apply(createOperationData.anchoredOperationModel, didState);
        expect(newDidState).toBeUndefined();
      }));
      it('should apply the create operation with { } as document if encoded data and suffix data do not match', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        verifyEncodedMultihashForContentSpy.and.returnValue(false);
        const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 1, transactionNumber: 1, operationIndex: 1 });
        const newDidState = yield operationProcessor.apply(createOperationData.anchoredOperationModel, undefined);
        expect(newDidState.lastOperationTransactionNumber).toEqual(1);
        expect(newDidState.document).toEqual({});
        expect(newDidState.nextRecoveryCommitmentHash).toEqual(createOperationData.operationRequest.suffixData.recoveryCommitment);
      }));
      it('should apply the create operation with { } as document if delta does not exist', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 1, transactionNumber: 1, operationIndex: 1 });
        spyOn(CreateOperation_1.default, 'parse').and.returnValue({ delta: undefined, suffixData: { recoveryCommitment: 'commitment' } });
        const newDidState = yield operationProcessor.apply(createOperationData.anchoredOperationModel, undefined);
        expect(newDidState.lastOperationTransactionNumber).toEqual(1);
        expect(newDidState.document).toEqual({});
        expect(newDidState.nextRecoveryCommitmentHash).toEqual('commitment');
      }));
      it('should apply the create operation with { } and advance update commitment as document if delta cannot be applied', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 1, transactionNumber: 1, operationIndex: 1 });
        spyOn(DocumentComposer_1.default, 'applyPatches').and.throwError('Expected test error');
        const newDidState = yield operationProcessor.apply(createOperationData.anchoredOperationModel, undefined);
        expect(newDidState.lastOperationTransactionNumber).toEqual(1);
        expect(newDidState.document).toEqual({});
        expect(newDidState.nextRecoveryCommitmentHash).toEqual(createOperationData.operationRequest.suffixData.recoveryCommitment);
        expect(newDidState.nextUpdateCommitmentHash).toEqual(createOperationData.operationRequest.delta.updateCommitment);
      }));
      it('should apply the create operation with { } and undefined update commitment as document if delta is undefined', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 1, transactionNumber: 1, operationIndex: 1 });
        const parsedOperation = yield CreateOperation_1.default.parse(createOperationData.anchoredOperationModel.operationBuffer);
        parsedOperation.delta = undefined;
        spyOn(CreateOperation_1.default, 'parse').and.returnValue(Promise.resolve(parsedOperation));
        const newDidState = yield operationProcessor.apply(createOperationData.anchoredOperationModel, undefined);
        expect(newDidState.lastOperationTransactionNumber).toEqual(1);
        expect(newDidState.document).toEqual({});
        expect(newDidState.nextRecoveryCommitmentHash).toEqual(createOperationData.operationRequest.suffixData.recoveryCommitment);
        expect(newDidState.nextUpdateCommitmentHash).toBeUndefined();
      }));
    });
    describe('applyUpdateOperation()', () => {
      it('should not apply update operation if update key and commitment are not pairs.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const [additionalKey] = yield OperationGenerator_1.default.generateKeyPair(`new-key1`);
        const updateOperationRequest = yield OperationGenerator_1.default.createUpdateOperationRequestForAddingAKey(didUniqueSuffix, (yield Jwk_1.default.generateEs256kKeyPair())[0], signingPrivateKey, additionalKey, OperationGenerator_1.default.generateRandomHash());
        const operationBuffer = Buffer.from(JSON.stringify(updateOperationRequest));
        const anchoredUpdateOperationModel = {
          type: OperationType_1.default.Update,
          didUniqueSuffix,
          operationBuffer,
          transactionTime: 2,
          transactionNumber: 2,
          operationIndex: 2
        };
        const newDidState = yield operationProcessor.apply(anchoredUpdateOperationModel, didState);
        expect(newDidState).toBeUndefined();
      }));
      it('should not apply update operation if signature is invalid.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const [additionalKey] = yield OperationGenerator_1.default.generateKeyPair(`new-key1`);
        const updateOperationRequest = yield OperationGenerator_1.default.createUpdateOperationRequestForAddingAKey(didUniqueSuffix, signingPublicKey.publicKeyJwk, recoveryPrivateKey, additionalKey, OperationGenerator_1.default.generateRandomHash());
        const operationBuffer = Buffer.from(JSON.stringify(updateOperationRequest));
        const anchoredUpdateOperationModel = {
          type: OperationType_1.default.Update,
          didUniqueSuffix,
          operationBuffer,
          transactionTime: 2,
          transactionNumber: 2,
          operationIndex: 2
        };
        const newDidState = yield operationProcessor.apply(anchoredUpdateOperationModel, didState);
        expect(newDidState).toBeUndefined();
      }));
      it('should not apply update operation if updateKey is invalid', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const [additionalKey] = yield OperationGenerator_1.default.generateKeyPair(`new-key1`);
        const [invalidUpdateKey] = yield OperationGenerator_1.default.generateKeyPair('invalid');
        const updateOperationRequest = yield OperationGenerator_1.default.createUpdateOperationRequestForAddingAKey(didUniqueSuffix, invalidUpdateKey.publicKeyJwk, signingPrivateKey, additionalKey, OperationGenerator_1.default.generateRandomHash());
        const operationBuffer = Buffer.from(JSON.stringify(updateOperationRequest));
        const anchoredUpdateOperationModel = {
          type: OperationType_1.default.Update,
          didUniqueSuffix,
          operationBuffer,
          transactionTime: 2,
          transactionNumber: 2,
          operationIndex: 2
        };
        const newDidState = yield operationProcessor.apply(anchoredUpdateOperationModel, didState);
        expect(newDidState).toBeUndefined();
      }));
      it('should not apply update operation if delta is undefined', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const [additionalKey] = yield OperationGenerator_1.default.generateKeyPair(`new-key1`);
        const updateOperationRequest = yield OperationGenerator_1.default.createUpdateOperationRequestForAddingAKey(didUniqueSuffix, signingPublicKey.publicKeyJwk, signingPrivateKey, additionalKey, OperationGenerator_1.default.generateRandomHash());
        const operationBuffer = Buffer.from(JSON.stringify(updateOperationRequest));
        const anchoredUpdateOperationModel = {
          type: OperationType_1.default.Update,
          didUniqueSuffix,
          operationBuffer,
          transactionTime: 2,
          transactionNumber: 2,
          operationIndex: 2
        };
        const modifiedUpdateOperation = yield UpdateOperation_1.default.parse(anchoredUpdateOperationModel.operationBuffer);
        modifiedUpdateOperation.delta = undefined;
        spyOn(UpdateOperation_1.default, 'parse').and.returnValue(Promise.resolve(modifiedUpdateOperation));
        const newDidState = yield operationProcessor.apply(anchoredUpdateOperationModel, didState);
        expect(newDidState).toBeUndefined();
      }));
      it('should not apply update operation if delta does not match delta hash', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const [additionalKey] = yield OperationGenerator_1.default.generateKeyPair(`new-key1`);
        const updateOperationRequest = yield OperationGenerator_1.default.createUpdateOperationRequestForAddingAKey(didUniqueSuffix, signingPublicKey.publicKeyJwk, signingPrivateKey, additionalKey, OperationGenerator_1.default.generateRandomHash());
        const operationBuffer = Buffer.from(JSON.stringify(updateOperationRequest));
        const anchoredUpdateOperationModel = {
          type: OperationType_1.default.Update,
          didUniqueSuffix,
          operationBuffer,
          transactionTime: 2,
          transactionNumber: 2,
          operationIndex: 2
        };
        const modifiedUpdateOperation = yield UpdateOperation_1.default.parse(anchoredUpdateOperationModel.operationBuffer);
        modifiedUpdateOperation.delta = {};
        spyOn(UpdateOperation_1.default, 'parse').and.returnValue(Promise.resolve(modifiedUpdateOperation));
        const newDidState = yield operationProcessor.apply(anchoredUpdateOperationModel, didState);
        expect(newDidState).toBeUndefined();
      }));
      it('should treat update a success and increment update commitment if any patch failed to apply.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const [additionalKey] = yield OperationGenerator_1.default.generateKeyPair(`new-key1`);
        const nextUpdateCommitment = OperationGenerator_1.default.generateRandomHash();
        const updateOperationRequest = yield OperationGenerator_1.default.createUpdateOperationRequestForAddingAKey(didUniqueSuffix, signingPublicKey.publicKeyJwk, signingPrivateKey, additionalKey, nextUpdateCommitment);
        const operationBuffer = Buffer.from(JSON.stringify(updateOperationRequest));
        const anchoredUpdateOperationModel = {
          type: OperationType_1.default.Update,
          didUniqueSuffix,
          operationBuffer,
          transactionTime: 2,
          transactionNumber: 2,
          operationIndex: 2
        };
        spyOn(DocumentComposer_1.default, 'applyPatches').and.callFake((document, _patch) => {
          document.publicKeys = [];
          throw new Error('any error');
        });
        const deepCopyOriginalDocument = JsObject_1.default.deepCopyObject(didState.document);
        const newDidState = yield operationProcessor.apply(anchoredUpdateOperationModel, didState);
        expect(newDidState.lastOperationTransactionNumber).toEqual(2);
        expect(newDidState.nextUpdateCommitmentHash).toEqual(nextUpdateCommitment);
        expect(newDidState.document).toEqual(deepCopyOriginalDocument);
      }));
    });
    describe('applyRecoverOperation()', () => {
      it('should not apply if recovery key hash is invalid.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const operationData = yield OperationGenerator_1.default.generateRecoverOperation({
          didUniqueSuffix,
          recoveryPrivateKey: signingPrivateKey
        });
        const anchoredRecoverOperationModel = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(operationData.recoverOperation, 2, 2, 2);
        const newDidState = yield operationProcessor.apply(anchoredRecoverOperationModel, didState);
        expect(newDidState).toBeUndefined();
      }));
      it('should not apply if recovery signature is invalid.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const operationData = yield OperationGenerator_1.default.generateRecoverOperation({
          didUniqueSuffix,
          recoveryPrivateKey
        });
        const anchoredRecoverOperationModel = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(operationData.recoverOperation, 2, 2, 2);
        const modifiedResult = yield RecoverOperation_1.default.parse(anchoredRecoverOperationModel.operationBuffer);
        spyOn(modifiedResult.signedDataJws, 'verifySignature').and.returnValue(Promise.resolve(false));
        spyOn(RecoverOperation_1.default, 'parse').and.returnValue(Promise.resolve(modifiedResult));
        const newDidState = yield operationProcessor.apply(anchoredRecoverOperationModel, didState);
        expect(newDidState).toBeUndefined();
      }));
      it('should apply successfully with resultant document being { } and advanced commit reveal when document composer fails to apply patches.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const document = {};
        const [anyNewRecoveryPublicKey] = yield Jwk_1.default.generateEs256kKeyPair();
        const newUpdateCommitment = OperationGenerator_1.default.generateRandomHash();
        const recoverOperationRequest = yield OperationGenerator_1.default.createRecoverOperationRequest(didUniqueSuffix, recoveryPrivateKey, anyNewRecoveryPublicKey, newUpdateCommitment, document);
        const recoverOperation = yield RecoverOperation_1.default.parse(Buffer.from(JSON.stringify(recoverOperationRequest)));
        const anchoredRecoverOperationModel = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(recoverOperation, 2, 2, 2);
        spyOn(DocumentComposer_1.default, 'applyPatches').and.throwError('Expected test error');
        const newDidState = yield operationProcessor.apply(anchoredRecoverOperationModel, didState);
        expect(newDidState.lastOperationTransactionNumber).toEqual(2);
        expect(newDidState.document).toEqual({});
        const expectedNewRecoveryCommitment = Multihash_1.default.canonicalizeThenDoubleHashThenEncode(anyNewRecoveryPublicKey);
        expect(newDidState.nextRecoveryCommitmentHash).toEqual(expectedNewRecoveryCommitment);
        expect(newDidState.nextUpdateCommitmentHash).toEqual(newUpdateCommitment);
      }));
      it('should still apply successfully with resultant document being { } if new document is in some unexpected format.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const document = 'unexpected document format';
        const [anyNewRecoveryPublicKey] = yield Jwk_1.default.generateEs256kKeyPair();
        const unusedNextUpdateCommitment = OperationGenerator_1.default.generateRandomHash();
        const recoverOperationRequest = yield OperationGenerator_1.default.createRecoverOperationRequest(didUniqueSuffix, recoveryPrivateKey, anyNewRecoveryPublicKey, unusedNextUpdateCommitment, document);
        const recoverOperation = yield RecoverOperation_1.default.parse(Buffer.from(JSON.stringify(recoverOperationRequest)));
        const anchoredRecoverOperationModel = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(recoverOperation, 2, 2, 2);
        const newDidState = yield operationProcessor.apply(anchoredRecoverOperationModel, didState);
        expect(newDidState.lastOperationTransactionNumber).toEqual(2);
        expect(newDidState.document).toEqual({});
        const expectedNewRecoveryCommitment = Multihash_1.default.canonicalizeThenDoubleHashThenEncode(anyNewRecoveryPublicKey);
        expect(newDidState.nextRecoveryCommitmentHash).toEqual(expectedNewRecoveryCommitment);
      }));
      it('should still apply successfully with resultant document being { } if delta hash mismatch.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const document = { publicKeys: [] };
        const [anyNewRecoveryPublicKey] = yield Jwk_1.default.generateEs256kKeyPair();
        const unusedNextUpdateCommitment = OperationGenerator_1.default.generateRandomHash();
        const recoverOperationRequest = yield OperationGenerator_1.default.createRecoverOperationRequest(didUniqueSuffix, recoveryPrivateKey, anyNewRecoveryPublicKey, unusedNextUpdateCommitment, document);
        const recoverOperation = yield RecoverOperation_1.default.parse(Buffer.from(JSON.stringify(recoverOperationRequest)));
        const anchoredRecoverOperationModel = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(recoverOperation, 2, 2, 2);
        verifyEncodedMultihashForContentSpy.and.callFake((_content, expectedHash) => {
          if (expectedHash === recoverOperation.signedData.deltaHash) {
            return false;
          } else {
            return true;
          }
        });
        const newDidState = yield operationProcessor.apply(anchoredRecoverOperationModel, didState);
        expect(newDidState.lastOperationTransactionNumber).toEqual(2);
        expect(newDidState.document).toEqual({});
        const expectedNewRecoveryCommitment = Multihash_1.default.canonicalizeThenDoubleHashThenEncode(anyNewRecoveryPublicKey);
        expect(newDidState.nextRecoveryCommitmentHash).toEqual(expectedNewRecoveryCommitment);
      }));
      it('should still apply successfully with resultant document being { } and update commitment not advanced if delta is undefined', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const document = { publicKeys: [] };
        const [anyNewRecoveryPublicKey] = yield Jwk_1.default.generateEs256kKeyPair();
        const unusedNextUpdateCommitment = OperationGenerator_1.default.generateRandomHash();
        const recoverOperationRequest = yield OperationGenerator_1.default.createRecoverOperationRequest(didUniqueSuffix, recoveryPrivateKey, anyNewRecoveryPublicKey, unusedNextUpdateCommitment, document);
        const recoverOperation = yield RecoverOperation_1.default.parse(Buffer.from(JSON.stringify(recoverOperationRequest)));
        const anchoredRecoverOperationModel = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(recoverOperation, 2, 2, 2);
        const parsedRecoveryOperation = yield RecoverOperation_1.default.parse(anchoredRecoverOperationModel.operationBuffer);
        parsedRecoveryOperation.delta = undefined;
        spyOn(RecoverOperation_1.default, 'parse').and.returnValue(Promise.resolve(parsedRecoveryOperation));
        const newDidState = yield operationProcessor.apply(anchoredRecoverOperationModel, didState);
        expect(newDidState.lastOperationTransactionNumber).toEqual(2);
        expect(newDidState.document).toEqual({});
        const expectedNewRecoveryCommitment = Multihash_1.default.canonicalizeThenDoubleHashThenEncode(anyNewRecoveryPublicKey);
        expect(newDidState.nextRecoveryCommitmentHash).toEqual(expectedNewRecoveryCommitment);
        expect(newDidState.nextUpdateCommitmentHash).toBeUndefined();
      }));
    });
    describe('applyDeactivateOperation()', () => {
      it('should not apply if calculated recovery key hash is invalid.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const [, anyIncorrectRecoveryPrivateKey] = yield Jwk_1.default.generateEs256kKeyPair();
        const deactivateOperationData = yield OperationGenerator_1.default.createDeactivateOperation(didUniqueSuffix, anyIncorrectRecoveryPrivateKey);
        const deactivateOperation = yield DeactivateOperation_1.default.parse(deactivateOperationData.operationBuffer);
        const anchoredDeactivateOperationModel = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(deactivateOperation, 2, 2, 2);
        const newDidState = yield operationProcessor.apply(anchoredDeactivateOperationModel, didState);
        expect(newDidState).toBeUndefined();
      }));
      it('should not apply if signature is invalid.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
        const deactivateOperationData = yield OperationGenerator_1.default.createDeactivateOperation(didUniqueSuffix, recoveryPrivateKey);
        const deactivateOperation = yield DeactivateOperation_1.default.parse(deactivateOperationData.operationBuffer);
        const anchoredDeactivateOperationModel = OperationGenerator_1.default.createAnchoredOperationModelFromOperationModel(deactivateOperation, 2, 2, 2);
        const modifiedResult = yield DeactivateOperation_1.default.parse(anchoredDeactivateOperationModel.operationBuffer);
        spyOn(modifiedResult.signedDataJws, 'verifySignature').and.returnValue(Promise.resolve(false));
        spyOn(DeactivateOperation_1.default, 'parse').and.returnValue(Promise.resolve(modifiedResult));
        const newDidState = yield operationProcessor.apply(anchoredDeactivateOperationModel, didState);
        expect(newDidState).toBeUndefined();
      }));
    });
  });
  describe('getMultihashRevealValue()', () => {
    it('should throw if a create operation is given.', () => tslib_1.__awaiter(void 0, void 0, void 0, function * () {
      const createOperationData = yield OperationGenerator_1.default.generateAnchoredCreateOperation({ transactionTime: 1, transactionNumber: 1, operationIndex: 1 });
      yield expectAsync(operationProcessor.getMultihashRevealValue(createOperationData.anchoredOperationModel))
        .toBeRejectedWith(new SidetreeError_1.default(ErrorCode_1.default.OperationProcessorCreateOperationDoesNotHaveRevealValue));
    }));
  });
}));
// # sourceMappingURL=OperationProcessor.spec.js.map
