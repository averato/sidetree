/// <reference types="node" />
import FetchResult from '../common/models/FetchResult';
import ICas from '../core/interfaces/ICas';
export default class Ipfs implements ICas {
    private uri;
    private fetchTimeoutInSeconds;
    private fetch;
    constructor(uri: string, fetchTimeoutInSeconds: number);
    write(content: Buffer): Promise<string>;
    read(casUri: string, maxSizeInBytes: number): Promise<FetchResult>;
    private fetchContent;
    private pinContent;
}
