import Config from './models/Config';
import IBlockchain from '../core/interfaces/IBlockchain';
import TransactionModel from '../common/models/TransactionModel';
import VersionManager from './VersionManager';
export default class Monitor {
    private blockchain;
    private operationQueue;
    private transactionStore;
    private readonly versionManager;
    constructor(config: Config, versionManager: VersionManager, blockchain: IBlockchain);
    initialize(): Promise<void>;
    getOperationQueueSize(): Promise<{
        operationQueueSize: number;
    }>;
    getWriterMaxBatchSize(): Promise<{
        writerMaxBatchSize: number;
    }>;
    getLastProcessedTransaction(): Promise<TransactionModel | undefined>;
}
