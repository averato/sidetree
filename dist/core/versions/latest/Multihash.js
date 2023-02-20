'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const crypto = require('crypto');
const Encoder_1 = require('./Encoder');
const ErrorCode_1 = require('./ErrorCode');
const JsonCanonicalizer_1 = require('./util/JsonCanonicalizer');
const Logger_1 = require('../../../common/Logger');
const SidetreeError_1 = require('../../../common/SidetreeError');
const multihashes = require('multihashes');
class Multihash {
  static hash (content, hashAlgorithmInMultihashCode) {
    const conventionalHash = this.hashAsNonMultihashBuffer(content, hashAlgorithmInMultihashCode);
    const multihash = multihashes.encode(conventionalHash, hashAlgorithmInMultihashCode);
    return multihash;
  }

  static hashAsNonMultihashBuffer (content, hashAlgorithmInMultihashCode) {
    let hash;
    switch (hashAlgorithmInMultihashCode) {
      case 18:
        hash = crypto.createHash('sha256').update(content).digest();
        break;
      case 22:
        hash = crypto.createHash('sha3-256').update(content).digest();
        break;
      default:
        throw new SidetreeError_1.default(ErrorCode_1.default.MultihashUnsupportedHashAlgorithm);
    }
    return hash;
  }

  static canonicalizeThenHashThenEncode (content, hashAlgorithmInMultihashCode) {
    const canonicalizedStringBuffer = JsonCanonicalizer_1.default.canonicalizeAsBuffer(content);
    if (hashAlgorithmInMultihashCode === undefined) {
      hashAlgorithmInMultihashCode = 18;
    }
    const multihashEncodedString = Multihash.hashThenEncode(canonicalizedStringBuffer, hashAlgorithmInMultihashCode);
    return multihashEncodedString;
  }

  static canonicalizeThenDoubleHashThenEncode (content) {
    const contentBuffer = JsonCanonicalizer_1.default.canonicalizeAsBuffer(content);
    const hashAlgorithmInMultihashCode = 18;
    const intermediateHashBuffer = Multihash.hashAsNonMultihashBuffer(contentBuffer, hashAlgorithmInMultihashCode);
    const multihashEncodedString = Multihash.hashThenEncode(intermediateHashBuffer, hashAlgorithmInMultihashCode);
    return multihashEncodedString;
  }

  static hashThenEncode (content, hashAlgorithmInMultihashCode) {
    const multihashBuffer = Multihash.hash(content, hashAlgorithmInMultihashCode);
    const multihashEncodedString = Encoder_1.default.encode(multihashBuffer);
    return multihashEncodedString;
  }

  static decode (multihashBuffer) {
    const multihash = multihashes.decode(multihashBuffer);
    return {
      algorithm: multihash.code,
      hash: multihash.digest
    };
  }

  static validateHashComputedUsingSupportedHashAlgorithm (encodedMultihash, supportedHashAlgorithmsInMultihashCode, inputContextForErrorLogging) {
    const multihashBuffer = Encoder_1.default.decodeAsBuffer(encodedMultihash);
    let multihash;
    try {
      multihash = multihashes.decode(multihashBuffer);
    } catch (_a) {
      throw new SidetreeError_1.default(ErrorCode_1.default.MultihashStringNotAMultihash, `Given ${inputContextForErrorLogging} string '${encodedMultihash}' is not a multihash.`);
    }
    if (!supportedHashAlgorithmsInMultihashCode.includes(multihash.code)) {
      throw new SidetreeError_1.default(ErrorCode_1.default.MultihashNotSupported, `Given ${inputContextForErrorLogging} uses unsupported multihash algorithm with code ${multihash.code}.`);
    }
  }

  static isValidHash (encodedContent, encodedMultihash) {
    if (encodedContent === undefined) {
      return false;
    }
    try {
      const contentBuffer = Encoder_1.default.decodeAsBuffer(encodedContent);
      return Multihash.verifyEncodedMultihashForContent(contentBuffer, encodedMultihash);
    } catch (error) {
      Logger_1.default.info(error);
      return false;
    }
  }

  static validateCanonicalizeObjectHash (content, expectedEncodedMultihash, inputContextForErrorLogging) {
    const contentBuffer = JsonCanonicalizer_1.default.canonicalizeAsBuffer(content);
    const validHash = Multihash.verifyEncodedMultihashForContent(contentBuffer, expectedEncodedMultihash);
    if (!validHash) {
      throw new SidetreeError_1.default(ErrorCode_1.default.CanonicalizedObjectHashMismatch, `Canonicalized ${inputContextForErrorLogging} object hash does not match expected hash '${expectedEncodedMultihash}'.`);
    }
  }

  static canonicalizeAndVerifyDoubleHash (content, encodedMultihash) {
    if (content === undefined) {
      return false;
    }
    try {
      const contentBuffer = JsonCanonicalizer_1.default.canonicalizeAsBuffer(content);
      return Multihash.verifyDoubleHash(contentBuffer, encodedMultihash);
    } catch (error) {
      Logger_1.default.info(error);
      return false;
    }
  }

  static verifyDoubleHash (content, encodedMultihash) {
    try {
      const expectedMultihashBuffer = Encoder_1.default.decodeAsBuffer(encodedMultihash);
      const hashAlgorithmCode = Multihash.decode(expectedMultihashBuffer).algorithm;
      const intermediateHashBuffer = Multihash.hashAsNonMultihashBuffer(content, hashAlgorithmCode);
      const actualMultihashBuffer = Multihash.hash(intermediateHashBuffer, hashAlgorithmCode);
      return Buffer.compare(actualMultihashBuffer, expectedMultihashBuffer) === 0;
    } catch (error) {
      Logger_1.default.info(error);
      return false;
    }
  }

  static verifyEncodedMultihashForContent (content, encodedMultihash) {
    try {
      const expectedMultihashBuffer = Encoder_1.default.decodeAsBuffer(encodedMultihash);
      const hashAlgorithmCode = Multihash.decode(expectedMultihashBuffer).algorithm;
      const actualMultihashBuffer = Multihash.hash(content, hashAlgorithmCode);
      const actualMultihashString = Encoder_1.default.encode(actualMultihashBuffer);
      return actualMultihashString === encodedMultihash;
    } catch (error) {
      Logger_1.default.info(error);
      return false;
    }
  }
}
exports.default = Multihash;
// # sourceMappingURL=Multihash.js.map
