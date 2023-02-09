/// <reference types="node" />
import DeltaModel from './models/DeltaModel';
import OperationModel from './models/OperationModel';
import OperationType from '../../enums/OperationType';
import SuffixDataModel from './models/SuffixDataModel';
export default class CreateOperation implements OperationModel {
    readonly operationBuffer: Buffer;
    readonly didUniqueSuffix: string;
    readonly suffixData: SuffixDataModel;
    readonly delta: DeltaModel | undefined;
    readonly type: OperationType;
    private constructor();
    static parse(operationBuffer: Buffer): Promise<CreateOperation>;
    static parseObject(operationObject: any, operationBuffer: Buffer): CreateOperation;
}
