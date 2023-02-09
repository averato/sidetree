/// <reference types="node" />
import ProvisionalIndexFileModel from './models/ProvisionalIndexFileModel';
import UpdateOperation from './UpdateOperation';
export default class ProvisionalIndexFile {
    readonly model: ProvisionalIndexFileModel;
    readonly didUniqueSuffixes: string[];
    private constructor();
    static parse(provisionalIndexFileBuffer: Buffer): Promise<ProvisionalIndexFile>;
    private static validateOperationsProperty;
    private static validateChunksProperty;
    static createBuffer(chunkFileUri: string, provisionalProofFileUri: string | undefined, updateOperationArray: UpdateOperation[]): Promise<Buffer>;
}
