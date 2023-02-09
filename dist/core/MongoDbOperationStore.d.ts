import AnchoredOperationModel from './models/AnchoredOperationModel';
import IOperationStore from './interfaces/IOperationStore';
import MongoDbStore from '../common/MongoDbStore';
export default class MongoDbOperationStore extends MongoDbStore implements IOperationStore {
    static readonly collectionName: string;
    constructor(serverUrl: string, databaseName: string);
    createIndex(): Promise<void>;
    insertOrReplace(operations: AnchoredOperationModel[]): Promise<void>;
    get(didUniqueSuffix: string): Promise<AnchoredOperationModel[]>;
    delete(transactionNumber?: number): Promise<void>;
    deleteUpdatesEarlierThan(didUniqueSuffix: string, transactionNumber: number, operationIndex: number): Promise<void>;
    private static convertToMongoOperation;
    private static convertToAnchoredOperationModel;
}
