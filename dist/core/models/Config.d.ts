export default interface Config {
    batchingIntervalInSeconds: number;
    blockchainServiceUri: string;
    databaseName: string;
    didMethodName: string;
    maxConcurrentDownloads: number;
    mongoDbConnectionString: string;
    observingIntervalInSeconds: number;
}
