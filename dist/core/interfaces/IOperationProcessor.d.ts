/// <reference types="node" />
import AnchoredOperationModel from '../models/AnchoredOperationModel';
import DidState from '../models/DidState';
export default interface IOperationProcessor {
    apply(operation: AnchoredOperationModel, didState: DidState | undefined): Promise<DidState | undefined>;
    getMultihashRevealValue(operation: AnchoredOperationModel): Promise<Buffer>;
}
