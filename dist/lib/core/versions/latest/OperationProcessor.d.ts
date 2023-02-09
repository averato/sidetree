/// <reference types="node" />
import AnchoredOperationModel from '../../models/AnchoredOperationModel';
import DidState from '../../models/DidState';
import IOperationProcessor from '../../interfaces/IOperationProcessor';
export default class OperationProcessor implements IOperationProcessor {
    apply(anchoredOperationModel: AnchoredOperationModel, didState: DidState | undefined): Promise<DidState | undefined>;
    getMultihashRevealValue(anchoredOperationModel: AnchoredOperationModel): Promise<Buffer>;
    private applyCreateOperation;
    private applyUpdateOperation;
    private applyRecoverOperation;
    private applyDeactivateOperation;
}
