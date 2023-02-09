import { Collection, Db, LoggerState, MongoClient } from 'mongodb';
export default class MongoDbStore {
    private serverUrl;
    private collectionName;
    private databaseName;
    static readonly defaultQueryTimeoutInMilliseconds = 10000;
    protected db: Db | undefined;
    protected collection: Collection<any>;
    static enableCommandResultLogging(client: MongoClient): void;
    static customLogger(_message: string | undefined, state: LoggerState | undefined): void;
    constructor(serverUrl: string, collectionName: string, databaseName: string);
    initialize(): Promise<void>;
    clearCollection(): Promise<void>;
    private createCollectionIfNotExist;
    createIndex(): Promise<void>;
}
