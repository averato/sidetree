/// <reference types="node" />
export default class ReadableStream {
    static readAll(stream: NodeJS.ReadableStream, maxAllowedSizeInBytes?: number): Promise<Buffer>;
}
