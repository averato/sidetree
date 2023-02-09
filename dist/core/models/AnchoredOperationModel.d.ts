/// <reference types="node" />
import OperationType from '../enums/OperationType';
export default interface AnchoredOperationModel {
    operationBuffer: Buffer;
    didUniqueSuffix: string;
    type: OperationType;
    transactionTime: number;
    transactionNumber: number;
    operationIndex: number;
}
