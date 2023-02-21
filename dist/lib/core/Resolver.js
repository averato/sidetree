"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Logger_1 = require("../common/Logger");
const Multihash_1 = require("./versions/latest/Multihash");
const OperationType_1 = require("./enums/OperationType");
const SidetreeError_1 = require("../common/SidetreeError");
class Resolver {
    constructor(versionManager, operationStore) {
        this.versionManager = versionManager;
        this.operationStore = operationStore;
    }
    resolve(didUniqueSuffix) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Resolving DID unique suffix '${didUniqueSuffix}'...`);
            const operations = yield this.operationStore.get(didUniqueSuffix);
            const operationsByType = Resolver.categorizeOperationsByType(operations);
            Logger_1.default.info(`DiD contains operations: ${JSON.stringify(operationsByType)}`);
            let didState = yield this.applyCreateOperation(operationsByType.createOperations);
            if (didState === undefined) {
                return undefined;
            }
            const recoverAndDeactivateOperations = operationsByType.recoverOperations.concat(operationsByType.deactivateOperations);
            const recoveryCommitValueToOperationMap = yield this.constructCommitValueToOperationLookupMap(recoverAndDeactivateOperations);
            didState = yield this.applyRecoverAndDeactivateOperations(didState, recoveryCommitValueToOperationMap);
            if (didState.nextRecoveryCommitmentHash === undefined) {
                return didState;
            }
            const updateCommitValueToOperationMap = yield this.constructCommitValueToOperationLookupMap(operationsByType.updateOperations);
            didState = yield this.applyUpdateOperations(didState, updateCommitValueToOperationMap);
            return didState;
        });
    }
    static categorizeOperationsByType(operations) {
        const createOperations = [];
        const recoverOperations = [];
        const updateOperations = [];
        const deactivateOperations = [];
        for (const operation of operations) {
            if (operation.type === OperationType_1.default.Create) {
                createOperations.push(operation);
            }
            else if (operation.type === OperationType_1.default.Recover) {
                recoverOperations.push(operation);
            }
            else if (operation.type === OperationType_1.default.Update) {
                updateOperations.push(operation);
            }
            else {
                deactivateOperations.push(operation);
            }
        }
        return {
            createOperations,
            recoverOperations,
            updateOperations,
            deactivateOperations
        };
    }
    applyCreateOperation(createOperations) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let didState;
            for (const createOperation of createOperations) {
                didState = yield this.applyOperation(createOperation, undefined);
                if (didState !== undefined) {
                    break;
                }
            }
            return didState;
        });
    }
    applyRecoverAndDeactivateOperations(startingDidState, commitValueToOperationMap) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const commitValuesUsed = new Set();
            let didState = startingDidState;
            while (commitValueToOperationMap.has(didState.nextRecoveryCommitmentHash)) {
                let operationsWithCorrectRevealValue = commitValueToOperationMap.get(didState.nextRecoveryCommitmentHash);
                operationsWithCorrectRevealValue = operationsWithCorrectRevealValue.sort((a, b) => a.transactionNumber - b.transactionNumber);
                const newDidState = yield this.applyFirstValidOperation(operationsWithCorrectRevealValue, didState, commitValuesUsed);
                if (newDidState === undefined) {
                    break;
                }
                if (newDidState.nextRecoveryCommitmentHash === undefined) {
                    return newDidState;
                }
                commitValuesUsed.add(didState.nextRecoveryCommitmentHash);
                didState = newDidState;
            }
            return didState;
        });
    }
    applyUpdateOperations(startingDidState, commitValueToOperationMap) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const commitValuesUsed = new Set();
            let didState = startingDidState;
            while (commitValueToOperationMap.has(didState.nextUpdateCommitmentHash)) {
                let operationsWithCorrectRevealValue = commitValueToOperationMap.get(didState.nextUpdateCommitmentHash);
                operationsWithCorrectRevealValue = operationsWithCorrectRevealValue.sort((a, b) => a.transactionNumber - b.transactionNumber);
                const newDidState = yield this.applyFirstValidOperation(operationsWithCorrectRevealValue, didState, commitValuesUsed);
                if (newDidState === undefined) {
                    break;
                }
                commitValuesUsed.add(didState.nextUpdateCommitmentHash);
                didState = newDidState;
            }
            return didState;
        });
    }
    applyOperation(operation, didState) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let appliedDidState;
            try {
                const operationProcessor = this.versionManager.getOperationProcessor(operation.transactionTime);
                appliedDidState = yield operationProcessor.apply(operation, didState);
            }
            catch (error) {
                if (error instanceof SidetreeError_1.default)
                    Logger_1.default.info(`Skipped bad operation for DID ${operation.didUniqueSuffix} at time ${operation.transactionTime}. Error: ${SidetreeError_1.default.stringify(error)}`);
                throw error;
            }
            return appliedDidState;
        });
    }
    applyFirstValidOperation(operations, originalDidState, commitValuesUsed) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const operation of operations) {
                const newDidState = yield this.applyOperation(operation, originalDidState);
                if (newDidState === undefined) {
                    continue;
                }
                if (Resolver.isCommitValueReused(operation.type, originalDidState, newDidState, commitValuesUsed)) {
                    continue;
                }
                return newDidState;
            }
            return undefined;
        });
    }
    static isCommitValueReused(operationType, oldDidState, newDidState, commitValuesUsed) {
        if (operationType === OperationType_1.default.Update) {
            return this.isUpdateCommitValueReused(oldDidState, newDidState, commitValuesUsed);
        }
        else {
            return this.isRecoverCommitValueReused(oldDidState, newDidState, commitValuesUsed);
        }
    }
    static isUpdateCommitValueReused(oldDidState, newDidState, commitValuesUsed) {
        if (newDidState.nextUpdateCommitmentHash !== undefined &&
            commitValuesUsed.has(newDidState.nextUpdateCommitmentHash)) {
            return true;
        }
        if (newDidState.nextUpdateCommitmentHash === oldDidState.nextUpdateCommitmentHash) {
            return true;
        }
        return false;
    }
    static isRecoverCommitValueReused(oldDidState, newDidState, commitValuesUsed) {
        if (newDidState.nextRecoveryCommitmentHash !== undefined &&
            commitValuesUsed.has(newDidState.nextRecoveryCommitmentHash)) {
            return true;
        }
        if (newDidState.nextRecoveryCommitmentHash === oldDidState.nextRecoveryCommitmentHash) {
            return true;
        }
        return false;
    }
    constructCommitValueToOperationLookupMap(nonCreateOperations) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const commitValueToOperationMap = new Map();
            for (const operation of nonCreateOperations) {
                const operationProcessor = this.versionManager.getOperationProcessor(operation.transactionTime);
                const multihashRevealValueBuffer = yield operationProcessor.getMultihashRevealValue(operation);
                const multihashRevealValue = Multihash_1.default.decode(multihashRevealValueBuffer);
                const commitValue = Multihash_1.default.hashThenEncode(multihashRevealValue.hash, multihashRevealValue.algorithm);
                if (commitValueToOperationMap.has(commitValue)) {
                    commitValueToOperationMap.get(commitValue).push(operation);
                }
                else {
                    commitValueToOperationMap.set(commitValue, [operation]);
                }
            }
            return commitValueToOperationMap;
        });
    }
}
exports.default = Resolver;
//# sourceMappingURL=Resolver.js.map