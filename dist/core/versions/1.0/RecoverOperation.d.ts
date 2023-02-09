/// <reference types="node" />
import DeltaModel from './models/DeltaModel';
import Jws from './util/Jws';
import OperationModel from './models/OperationModel';
import OperationType from '../../enums/OperationType';
import SignedDataModel from './models/RecoverSignedDataModel';
export default class RecoverOperation implements OperationModel {
    readonly operationBuffer: Buffer;
    readonly didUniqueSuffix: string;
    readonly revealValue: string;
    readonly signedDataJws: Jws;
    readonly signedData: SignedDataModel;
    readonly delta: DeltaModel | undefined;
    readonly type: OperationType;
    private constructor();
    static parse(operationBuffer: Buffer): Promise<RecoverOperation>;
    static parseObject(operationObject: any, operationBuffer: Buffer): Promise<RecoverOperation>;
    static parseSignedDataPayload(signedDataEncodedString: string): Promise<SignedDataModel>;
}
