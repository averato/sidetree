import { Collection, Db, MongoClient } from 'mongodb';
export default class MongoDbStore {
    private serverUrl;
    private collectionName;
    private databaseName;
    static readonly defaultQueryTimeoutInMilliseconds = 10000;
    protected db: Db | undefined;
    protected collection: Collection<any>;
    static enableCommandResultLogging(client: MongoClient): void;
    constructor(serverUrl: string, collectionName: string, databaseName: string);
    initialize(): Promise<void>;
    clearCollection(): Promise<void>;
    private createCollectionIfNotExist;
    createIndex(): Promise<void>;
}
