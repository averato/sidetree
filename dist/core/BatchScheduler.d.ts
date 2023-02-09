import IBlockchain from './interfaces/IBlockchain';
import IVersionManager from './interfaces/IVersionManager';
export default class BatchScheduler {
    private versionManager;
    private blockchain;
    private batchingIntervalInSeconds;
    private continuePeriodicBatchWriting;
    constructor(versionManager: IVersionManager, blockchain: IBlockchain, batchingIntervalInSeconds: number);
    startPeriodicBatchWriting(): void;
    stopPeriodicBatchWriting(): void;
    writeOperationBatch(): Promise<void>;
}
