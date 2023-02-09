/// <reference types="node" />
export default interface IBitcoinFileReader {
    listBlockFiles(): string[];
    readBlockFile(fileName: string): Buffer;
}
