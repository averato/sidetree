/// <reference types="node" />
import OperationModel from './models/OperationModel';
export default class Operation {
    static readonly maxEncodedRevealValueLength = 50;
    static parse(operationBuffer: Buffer): Promise<OperationModel>;
    static validateDelta(delta: any): void;
}
