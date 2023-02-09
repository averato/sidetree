/// <reference types="node" />
import CoreIndexFileModel from './models/CoreIndexFileModel';
import CreateOperation from './CreateOperation';
import DeactivateOperation from './DeactivateOperation';
import RecoverOperation from './RecoverOperation';
export default class CoreIndexFile {
    readonly model: CoreIndexFileModel;
    readonly didUniqueSuffixes: string[];
    readonly createDidSuffixes: string[];
    readonly recoverDidSuffixes: string[];
    readonly deactivateDidSuffixes: string[];
    private constructor();
    static parse(coreIndexFileBuffer: Buffer): Promise<CoreIndexFile>;
    static createModel(writerLockId: string | undefined, provisionalIndexFileUri: string | undefined, coreProofFileUri: string | undefined, createOperationArray: CreateOperation[], recoverOperationArray: RecoverOperation[], deactivateOperationArray: DeactivateOperation[]): Promise<CoreIndexFileModel>;
    static createBuffer(writerLockId: string | undefined, provisionalIndexFileUri: string | undefined, coreProofFileUri: string | undefined, createOperations: CreateOperation[], recoverOperations: RecoverOperation[], deactivateOperations: DeactivateOperation[]): Promise<Buffer>;
    private static validateWriterLockId;
    private static validateCreateReferences;
}
