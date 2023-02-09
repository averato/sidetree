/// <reference types="node" />
import ChunkFileModel from './models/ChunkFileModel';
import CreateOperation from './CreateOperation';
import RecoverOperation from './RecoverOperation';
import UpdateOperation from './UpdateOperation';
export default class ChunkFile {
    static parse(chunkFileBuffer: Buffer): Promise<ChunkFileModel>;
    private static validateDeltasProperty;
    static createBuffer(createOperations: CreateOperation[], recoverOperations: RecoverOperation[], updateOperations: UpdateOperation[]): Promise<Buffer | undefined>;
}
