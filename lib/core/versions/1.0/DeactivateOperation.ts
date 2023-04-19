import Encoder from './Encoder.ts';
import ErrorCode from './ErrorCode.ts';
import InputValidator from './InputValidator.ts';
import JsonAsync from './util/JsonAsync.ts';
import Jwk from './util/Jwk.ts';
import Jws from './util/Jws.ts';
import Multihash from './Multihash.ts';
import OperationModel from './models/OperationModel.ts';
import OperationType from '../../enums/OperationType.ts';
import SidetreeError from '../../../common/SidetreeError.ts';
import SignedDataModel from './models/DeactivateSignedDataModel.ts';
import { Buffer } from 'node:buffer';


/**
 * A class that represents a deactivate operation.
 */
export default class DeactivateOperation implements OperationModel {
  /** The type of operation. */
  public readonly type: OperationType = OperationType.Deactivate;

  /**
   * NOTE: should only be used by `parse()` and `parseObject()` else the constructed instance could be invalid.
   */
  private constructor (
    public readonly operationBuffer: Buffer,
    public readonly didUniqueSuffix: string,
    public readonly revealValue: string,
    public readonly signedDataJws: Jws,
    public readonly signedData: SignedDataModel
  ) { }

  /**
   * Parses the given buffer as a `UpdateOperation`.
   */
  public static async parse (operationBuffer: Buffer): Promise<DeactivateOperation> {
    const operationJsonString = operationBuffer.toString();
    const operationObject = await JsonAsync.parse(operationJsonString);
    const deactivateOperation = await DeactivateOperation.parseObject(operationObject, operationBuffer);
    return deactivateOperation;
  }

  /**
   * Parses the given operation object as a `DeactivateOperation`.
   * The `operationBuffer` given is assumed to be valid and is assigned to the `operationBuffer` directly.
   * NOTE: This method is purely intended to be used as an optimization method over the `parse` method in that
   * JSON parsing is not required to be performed more than once when an operation buffer of an unknown operation type is given.
   */
  public static async parseObject (operationObject: any, operationBuffer: Buffer): Promise<DeactivateOperation> {
    InputValidator.validateObjectContainsOnlyAllowedProperties(
      operationObject, ['type', 'didSuffix', 'revealValue', 'signedData'], 'deactivate request'
    );

    if (operationObject.type !== OperationType.Deactivate) {
      throw new SidetreeError(ErrorCode.DeactivateOperationTypeIncorrect);
    }

    InputValidator.validateEncodedMultihash(operationObject.didSuffix, 'deactivate request didSuffix');
    InputValidator.validateEncodedMultihash(operationObject.revealValue, 'deactivate request reveal value');

    const signedDataJws = Jws.parseCompactJws(operationObject.signedData);
    const signedDataModel = await DeactivateOperation.parseSignedDataPayload(
      signedDataJws.payload, operationObject.didSuffix);

    // Validate that the canonicalized recovery public key hash is the same as `revealValue`.
    Multihash.validateCanonicalizeObjectHash(signedDataModel.recoveryKey, operationObject.revealValue, 'deactivate request recovery key');

    return new DeactivateOperation(
      operationBuffer,
      operationObject.didSuffix,
      operationObject.revealValue,
      signedDataJws,
      signedDataModel
    );
  }

  /**
   * Parses the signed data payload of a deactivate operation.
   */
  public static async parseSignedDataPayload (
    signedDataEncodedString: string, expectedDidUniqueSuffix: string): Promise<SignedDataModel> {

    const signedDataJsonString = Encoder.decodeAsString(signedDataEncodedString);
    const signedData = await JsonAsync.parse(signedDataJsonString);

    const properties = Object.keys(signedData);
    if (properties.length !== 2) {
      throw new SidetreeError(ErrorCode.DeactivateOperationSignedDataMissingOrUnknownProperty);
    }

    if (signedData.didSuffix !== expectedDidUniqueSuffix) {
      throw new SidetreeError(ErrorCode.DeactivateOperationSignedDidUniqueSuffixMismatch);
    }

    Jwk.validateJwkEs256k(signedData.recoveryKey);

    return signedData;
  }
}
