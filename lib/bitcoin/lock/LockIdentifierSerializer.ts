import ErrorCode from '../ErrorCode.ts';
import LockIdentifierModel from '../models/LockIdentifierModel.ts';
import SidetreeError from '../../common/SidetreeError.ts';
import base64url from 'npm:base64url';

/**
 * Encapsulates functionality to serialize and deserialize a lock identifier.
 */
export default class LockIdentifierSerializer {

  private static readonly delimiter = '.';

  /**
   * Returns the string representation of this identifier.
   */
  public static serialize (lockIdentifier: LockIdentifierModel): string {
    const delim = LockIdentifierSerializer.delimiter;

    const concatenatedData = `${lockIdentifier.transactionId}${delim}${lockIdentifier.redeemScriptAsHex}`;
    return base64url.encode(concatenatedData);
  }

  /**
   * Gets this object from the serialized input.
   * @param serialized The serialized lock.
   */
  public static deserialize (serialized: string): LockIdentifierModel {
    const decodedString = base64url.decode(serialized);
    const splitDecodedString = decodedString.split(LockIdentifierSerializer.delimiter);

    if (splitDecodedString.length !== 2) {
      throw new SidetreeError(ErrorCode.LockIdentifierIncorrectFormat, `Input: ${serialized}`);
    }

    return {
      transactionId: splitDecodedString[0],
      redeemScriptAsHex: splitDecodedString[1]
    };
  }
}
