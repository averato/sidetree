import ServiceVersionModel from '../common/models/ServiceVersionModel';
export default class ServiceVersionFetcher {
    private uri;
    private static readonly fetchWaitTimeInMilliseconds;
    private fetch;
    private cachedVersion;
    private lastTryFetchTime;
    constructor(uri: string);
    getVersion(): Promise<ServiceVersionModel>;
    private tryGetServiceVersion;
    private static get emptyServiceVersion();
}
