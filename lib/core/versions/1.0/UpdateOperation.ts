import DeltaModel from './models/DeltaModel.ts';
import Encoder from './Encoder.ts';
import ErrorCode from './ErrorCode.ts';
import InputValidator from './InputValidator.ts';
import JsonAsync from './util/JsonAsync.ts';
import Jwk from './util/Jwk.ts';
import Jws from './util/Jws.ts';
import Multihash from './Multihash.ts';
import Operation from './Operation.ts';
import OperationModel from './models/OperationModel.ts';
import OperationType from '../../enums/OperationType.ts';
import SidetreeError from '../../../common/SidetreeError.ts';
import SignedDataModel from './models/UpdateSignedDataModel.ts';
import { Buffer } from 'node:buffer';


/**
 * A class that represents an update operation.
 */
export default class UpdateOperation implements OperationModel {
  /** The type of operation. */
  public readonly type: OperationType = OperationType.Update;

  /**
   * NOTE: should only be used by `parse()` and `parseObject()` else the constructed instance could be invalid.
   */
  private constructor (
    public readonly operationBuffer: Buffer,
    public readonly didUniqueSuffix: string,
    public readonly revealValue: string,
    public readonly signedDataJws: Jws,
    public readonly signedData: SignedDataModel,
    public readonly delta: DeltaModel | undefined
  ) { }

  /**
   * Parses the given buffer as a `UpdateOperation`.
   */
  public static async parse (operationBuffer: Buffer): Promise<UpdateOperation> {
    const operationJsonString = operationBuffer.toString();
    const operationObject = await JsonAsync.parse(operationJsonString);
    const updateOperation = await UpdateOperation.parseObject(operationObject, operationBuffer);
    return updateOperation;
  }

  /**
   * Parses the given operation object as a `UpdateOperation`.
   * The `operationBuffer` given is assumed to be valid and is assigned to the `operationBuffer` directly.
   * NOTE: This method is purely intended to be used as an optimization method over the `parse` method in that
   * JSON parsing is not required to be performed more than once when an operation buffer of an unknown operation type is given.
   */
  public static async parseObject (operationObject: any, operationBuffer: Buffer): Promise<UpdateOperation> {
    InputValidator.validateObjectContainsOnlyAllowedProperties(
      operationObject, ['type', 'didSuffix', 'revealValue', 'signedData', 'delta'], 'update request'
    );

    if (operationObject.type !== OperationType.Update) {
      throw new SidetreeError(ErrorCode.UpdateOperationTypeIncorrect);
    }

    InputValidator.validateEncodedMultihash(operationObject.didSuffix, 'update request didSuffix');
    InputValidator.validateEncodedMultihash(operationObject.revealValue, 'update request reveal value');

    const signedData = Jws.parseCompactJws(operationObject.signedData);
    const signedDataModel = await UpdateOperation.parseSignedDataPayload(signedData.payload);

    // Validate that the canonicalized update key hash is the same as `revealValue`.
    Multihash.validateCanonicalizeObjectHash(signedDataModel.updateKey, operationObject.revealValue, 'update request update key');

    Operation.validateDelta(operationObject.delta);

    return new UpdateOperation(operationBuffer, operationObject.didSuffix, operationObject.revealValue, signedData, signedDataModel, operationObject.delta);
  }

  /**
   * Parses the signed data payload of an update operation.
   */
  public static async parseSignedDataPayload (signedDataEncodedString: string): Promise<SignedDataModel> {
    const signedDataJsonString = Encoder.decodeAsString(signedDataEncodedString);
    const signedData = await JsonAsync.parse(signedDataJsonString);

    const properties = Object.keys(signedData);
    if (properties.length !== 2) {
      throw new SidetreeError(ErrorCode.UpdateOperationSignedDataHasMissingOrUnknownProperty);
    }

    Jwk.validateJwkEs256k(signedData.updateKey);

    InputValidator.validateEncodedMultihash(signedData.deltaHash, 'update operation delta hash');

    return signedData;
  }
}
