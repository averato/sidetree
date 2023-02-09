/// <reference types="node" />
import FetchResult from '../../lib/common/models/FetchResult';
import ICas from '../../lib/core/interfaces/ICas';
export default class MockCas implements ICas {
    private storage;
    private mockSecondsTakenForEachCasFetch;
    constructor(mockSecondsTakenForEachCasFetch?: number);
    static getAddress(content: Buffer): string;
    write(content: Buffer): Promise<string>;
    read(address: string, _maxSizeInBytes: number): Promise<FetchResult>;
}
