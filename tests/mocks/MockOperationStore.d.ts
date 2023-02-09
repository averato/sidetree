import AnchoredOperationModel from '../../lib/core/models/AnchoredOperationModel';
import IOperationStore from '../../lib/core/interfaces/IOperationStore';
export default class MockOperationStore implements IOperationStore {
    private readonly didToOperations;
    private readonly didUpdatedSinceLastSort;
    private insert;
    insertOrReplace(operations: AnchoredOperationModel[]): Promise<void>;
    get(didUniqueSuffix: string): Promise<AnchoredOperationModel[]>;
    delete(transactionNumber?: number): Promise<void>;
    deleteUpdatesEarlierThan(_didUniqueSuffix: string, _transactionNumber: number, _operationIndex: number): Promise<void>;
    private static removeOperations;
    private ensureDidContainerExist;
}
