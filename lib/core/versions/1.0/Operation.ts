import CreateOperation from './CreateOperation.ts';
import DeactivateOperation from './DeactivateOperation.ts';
import DocumentComposer from './DocumentComposer.ts';
import ErrorCode from './ErrorCode.ts';
import InputValidator from './InputValidator.ts';
import Logger from '../../../common/Logger.ts';
import OperationModel from './models/OperationModel.ts';
import OperationType from '../../enums/OperationType.ts';
import RecoverOperation from './RecoverOperation.ts';
import SidetreeError from '../../../common/SidetreeError.ts';
import UpdateOperation from './UpdateOperation.ts';
import { Buffer } from 'node:buffer';

/**
 * A class that contains Sidetree operation utility methods.
 */
export default class Operation {
  /** Maximum allowed encoded reveal value string length. */
  public static readonly maxEncodedRevealValueLength = 50;

  /**
   * Parses the given buffer into an `OperationModel`.
   */
  public static async parse (operationBuffer: Buffer): Promise<OperationModel> {
    // Parse request buffer into a JS object.
    const operationJsonString = operationBuffer.toString();
    // Logger.info(`Operation params: ${operationJsonString}`);
    const operationObject = JSON.parse(operationJsonString);
    const operationType = operationObject.type;

    if (operationType === OperationType.Create) {
//      Logger.info(`Create Operation parsed object: ${JSON.stringify(operationObject)}`);

      return CreateOperation.parseObject(operationObject, operationBuffer);
    } else if (operationType === OperationType.Update) {
      return UpdateOperation.parseObject(operationObject, operationBuffer);
    } else if (operationType === OperationType.Recover) {
      return RecoverOperation.parseObject(operationObject, operationBuffer);
    } else if (operationType === OperationType.Deactivate) {
      return DeactivateOperation.parseObject(operationObject, operationBuffer);
    } else {
        
        Logger.error(`Operation error: ${JSON.stringify(operationObject)}`);

        throw new SidetreeError(ErrorCode.OperationTypeUnknownOrMissing);
    }
  }

  /**
   * validate delta and throw if invalid
   * @param delta the delta to validate
   */
  public static validateDelta (delta: any): void {
    InputValidator.validateNonArrayObject(delta, 'delta');
    InputValidator.validateObjectContainsOnlyAllowedProperties(delta, ['patches', 'updateCommitment'], 'delta');
 
    // Validate `patches` property using the DocumentComposer.
    // TODO: make sure it is not broken
    DocumentComposer.validateDocumentPatches(delta.patches);
    
    InputValidator.validateEncodedMultihash(delta.updateCommitment, 'update commitment');
  }
}
