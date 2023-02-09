/// <reference types="node" />
import QueuedOperationModel from '../models/QueuedOperationModel';
export default interface IOperationQueue {
    enqueue(didUniqueSuffix: string, operationBuffer: Buffer): Promise<void>;
    dequeue(count: number): Promise<QueuedOperationModel[]>;
    peek(count: number): Promise<QueuedOperationModel[]>;
    contains(didUniqueSuffix: string): Promise<boolean>;
    getSize(): Promise<number>;
}
