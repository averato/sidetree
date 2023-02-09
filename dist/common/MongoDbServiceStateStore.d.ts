import IServiceStateStore from './interfaces/IServiceStateStore';
import MongoDbStore from './MongoDbStore';
export default class MongoDbServiceStateStore<T> extends MongoDbStore implements IServiceStateStore<T> {
    static readonly collectionName = "service";
    constructor(serverUrl: string, databaseName: string);
    put(serviceState: T): Promise<void>;
    get(): Promise<T>;
}
