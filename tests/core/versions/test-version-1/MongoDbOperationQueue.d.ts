/// <reference types="node" />
import MockOperationQueue from '../../../mocks/MockOperationQueue';
export default class MongoDbOperationQueue extends MockOperationQueue {
    private connectionString;
    constructor(connectionString: string);
    initialize(): void;
    enqueue(didUniqueSuffix: string, operationBuffer: Buffer): Promise<void>;
}
