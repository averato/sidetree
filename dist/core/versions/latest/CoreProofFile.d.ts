/// <reference types="node" />
import CoreProofFileModel from './models/CoreProofFileModel';
import DeactivateOperation from './DeactivateOperation';
import DeactivateSignedDataModel from './models/DeactivateSignedDataModel';
import Jws from './util/Jws';
import RecoverOperation from './RecoverOperation';
import RecoverSignedDataModel from './models/RecoverSignedDataModel';
export default class CoreProofFile {
    readonly coreProofFileModel: CoreProofFileModel;
    readonly recoverProofs: {
        signedDataJws: Jws;
        signedDataModel: RecoverSignedDataModel;
    }[];
    readonly deactivateProofs: {
        signedDataJws: Jws;
        signedDataModel: DeactivateSignedDataModel;
    }[];
    private constructor();
    static createBuffer(recoverOperations: RecoverOperation[], deactivateOperations: DeactivateOperation[]): Promise<Buffer | undefined>;
    static parse(coreProofFileBuffer: Buffer, expectedDeactivatedDidUniqueSuffixes: string[]): Promise<CoreProofFile>;
}
