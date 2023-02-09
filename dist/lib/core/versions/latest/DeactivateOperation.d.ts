/// <reference types="node" />
import Jws from './util/Jws';
import OperationModel from './models/OperationModel';
import OperationType from '../../enums/OperationType';
import SignedDataModel from './models/DeactivateSignedDataModel';
export default class DeactivateOperation implements OperationModel {
    readonly operationBuffer: Buffer;
    readonly didUniqueSuffix: string;
    readonly revealValue: string;
    readonly signedDataJws: Jws;
    readonly signedData: SignedDataModel;
    readonly type: OperationType;
    private constructor();
    static parse(operationBuffer: Buffer): Promise<DeactivateOperation>;
    static parseObject(operationObject: any, operationBuffer: Buffer): Promise<DeactivateOperation>;
    static parseSignedDataPayload(signedDataEncodedString: string, expectedDidUniqueSuffix: string): Promise<SignedDataModel>;
}
