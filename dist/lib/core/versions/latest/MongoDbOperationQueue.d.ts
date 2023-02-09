/// <reference types="node" />
import IOperationQueue from './interfaces/IOperationQueue';
import MongoDbStore from '../../../common/MongoDbStore';
import QueuedOperationModel from './models/QueuedOperationModel';
export default class MongoDbOperationQueue extends MongoDbStore implements IOperationQueue {
    static readonly collectionName: string;
    constructor(serverUrl: string, databaseName: string);
    createIndex(): Promise<void>;
    enqueue(didUniqueSuffix: string, operationBuffer: Buffer): Promise<void>;
    dequeue(count: number): Promise<QueuedOperationModel[]>;
    peek(count: number): Promise<QueuedOperationModel[]>;
    contains(didUniqueSuffix: string): Promise<boolean>;
    getSize(): Promise<number>;
    private static convertToQueuedOperationModel;
}
