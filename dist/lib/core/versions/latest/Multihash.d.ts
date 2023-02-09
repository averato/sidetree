/// <reference types="node" />
export default class Multihash {
    static hash(content: Buffer, hashAlgorithmInMultihashCode: number): Buffer;
    static hashAsNonMultihashBuffer(content: Buffer, hashAlgorithmInMultihashCode: number): Buffer;
    static canonicalizeThenHashThenEncode(content: object, hashAlgorithmInMultihashCode?: number): string;
    static canonicalizeThenDoubleHashThenEncode(content: object): string;
    static hashThenEncode(content: Buffer, hashAlgorithmInMultihashCode: number): string;
    static decode(multihashBuffer: Buffer): {
        algorithm: number;
        hash: Buffer;
    };
    static validateHashComputedUsingSupportedHashAlgorithm(encodedMultihash: string, supportedHashAlgorithmsInMultihashCode: number[], inputContextForErrorLogging: string): void;
    static isValidHash(encodedContent: string | undefined, encodedMultihash: string): boolean;
    static validateCanonicalizeObjectHash(content: object, expectedEncodedMultihash: string, inputContextForErrorLogging: string): void;
    static canonicalizeAndVerifyDoubleHash(content: object | undefined, encodedMultihash: string): boolean;
    private static verifyDoubleHash;
    static verifyEncodedMultihashForContent(content: Buffer, encodedMultihash: string): boolean;
}
