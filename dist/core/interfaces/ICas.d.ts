/// <reference types="node" />
import FetchResult from '../../common/models/FetchResult';
export default interface ICas {
    write(content: Buffer): Promise<string>;
    read(address: string, maxSizeInBytes: number): Promise<FetchResult>;
}
