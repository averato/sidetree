import canonicalize from 'npm:canonicalize';
import { Buffer } from 'node:buffer';

/**
 * Class containing reusable JSON canonicalization operations using JSON Canonicalization Scheme (JCS).
 */
export default class JsonCanonicalizer {
  /**
   * Canonicalizes the given content as a UTF8 buffer.
   */
  public static canonicalizeAsBuffer (content: object): Buffer {
    const canonicalizedString: string = canonicalize(content);
    const contentBuffer = Buffer.from(canonicalizedString);
    return contentBuffer;
  }
}
