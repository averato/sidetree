/// <reference types="node" />
import OperationType from '../../../enums/OperationType';
export default interface OperationModel {
    didUniqueSuffix: string;
    type: OperationType;
    operationBuffer: Buffer;
}
