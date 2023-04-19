import OperationType from '../../../enums/OperationType.ts';

/**
 * Common model for a Sidetree operation.
 */
export default interface OperationModel {
  didUniqueSuffix: string;
  type: OperationType;
  operationBuffer: Buffer;
}
