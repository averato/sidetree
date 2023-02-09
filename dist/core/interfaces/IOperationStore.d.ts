import AnchoredOperationModel from '../models/AnchoredOperationModel';
export default interface IOperationStore {
    insertOrReplace(operations: AnchoredOperationModel[]): Promise<void>;
    get(didUniqueSuffix: string): Promise<AnchoredOperationModel[]>;
    delete(transactionNumber?: number): Promise<void>;
    deleteUpdatesEarlierThan(didUniqueSuffix: string, transactionNumber: number, operationIndex: number): Promise<void>;
}
