import OperationReferenceModel from './OperationReferenceModel.ts';

/**
 * Defines the external Map File structure.
 */
export default interface ProvisionalIndexFileModel {
  provisionalProofFileUri?: string;
  operations?: {
    update: OperationReferenceModel[]
  };
  chunks: {
    chunkFileUri: string
  }[];
}
