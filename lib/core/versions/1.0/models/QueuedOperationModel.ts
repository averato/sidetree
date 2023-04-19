import { Buffer } from 'node:buffer';

/**
 * Defines a queued operation.
 */
export default interface QueuedOperationModel {
  didUniqueSuffix: string;
  operationBuffer: Buffer;
}
