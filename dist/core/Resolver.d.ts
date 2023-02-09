import DidState from './models/DidState';
import IOperationStore from './interfaces/IOperationStore';
import IVersionManager from './interfaces/IVersionManager';
export default class Resolver {
    private versionManager;
    private operationStore;
    constructor(versionManager: IVersionManager, operationStore: IOperationStore);
    resolve(didUniqueSuffix: string): Promise<DidState | undefined>;
    private static categorizeOperationsByType;
    private applyCreateOperation;
    private applyRecoverAndDeactivateOperations;
    private applyUpdateOperations;
    private applyOperation;
    private applyFirstValidOperation;
    private static isCommitValueReused;
    private static isUpdateCommitValueReused;
    private static isRecoverCommitValueReused;
    private constructCommitValueToOperationLookupMap;
}
