/// <reference types="node" />
import Jws from './util/Jws';
import ProvisionalProofFileModel from './models/ProvisionalProofFileModel';
import UpdateOperation from './UpdateOperation';
import UpdateSignedDataModel from './models/UpdateSignedDataModel';
export default class ProvisionalProofFile {
    readonly provisionalProofFileModel: ProvisionalProofFileModel;
    readonly updateProofs: {
        signedDataJws: Jws;
        signedDataModel: UpdateSignedDataModel;
    }[];
    private constructor();
    static createBuffer(updateOperations: UpdateOperation[]): Promise<Buffer | undefined>;
    static parse(provisionalProofFileBuffer: Buffer): Promise<ProvisionalProofFile>;
}
