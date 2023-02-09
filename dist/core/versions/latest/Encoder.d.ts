/// <reference types="node" />
export default class Encoder {
    static encode(content: Buffer | string): string;
    static decodeAsBuffer(encodedContent: string): Buffer;
    static decodeAsString(encodedContent: string): string;
    static decodeBase64UrlAsString(input: string): string;
    private static validateBase64UrlString;
    static isBase64UrlString(input: string): boolean;
}
