import OperationReferenceModel from './OperationReferenceModel';
export default interface ProvisionalIndexFileModel {
    provisionalProofFileUri?: string;
    operations?: {
        update: OperationReferenceModel[];
    };
    chunks: {
        chunkFileUri: string;
    }[];
}
