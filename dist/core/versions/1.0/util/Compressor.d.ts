/// <reference types="node" />
export default class Compressor {
    static readonly estimatedDecompressionMultiplier = 3;
    private static readonly gzipAsync;
    static compress(inputAsBuffer: Buffer): Promise<Buffer>;
    static decompress(inputAsBuffer: Buffer, maxAllowedDecompressedSizeInBytes: number): Promise<Buffer>;
}
