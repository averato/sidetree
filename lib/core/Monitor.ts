import BatchWriter from './versions/latest/BatchWriter.ts';
import Config from './models/Config.ts';
import IBlockchain from '../core/interfaces/IBlockchain.ts';
import MongoDbOperationQueue from './versions/latest/MongoDbOperationQueue.ts';
import MongoDbTransactionStore from '../common/MongoDbTransactionStore.ts';
import TransactionModel from '../common/models/TransactionModel.ts';
import VersionManager from './VersionManager.ts';

/**
 * An class to monitor the Core.
 * NOTE: this class can be completely decoupled from Core, Core does not need this class at all to function.
 */
export default class Monitor {

  private blockchain: IBlockchain;
  private operationQueue: MongoDbOperationQueue;
  private transactionStore: MongoDbTransactionStore;
  private readonly versionManager: VersionManager;

  public constructor (config: Config, versionManager: VersionManager, blockchain: IBlockchain) {
    this.operationQueue = new MongoDbOperationQueue(config.mongoDbConnectionString, config.databaseName);
    this.transactionStore = new MongoDbTransactionStore(config.mongoDbConnectionString, config.databaseName);
    this.blockchain = blockchain;
    this.versionManager = versionManager;
  }

  public async initialize () {
    await this.transactionStore.initialize();
    await this.operationQueue.initialize();
  }

  /**
   * Gets the size of the operation queue.
   */
  public async getOperationQueueSize (): Promise<{ operationQueueSize: number}> {
    const operationQueueSize = await this.operationQueue.getSize();

    return { operationQueueSize };
  }

  /**
   * Gets the maximum batch size the writer is currently capable of writing.
   */
  public async getWriterMaxBatchSize (): Promise<{ writerMaxBatchSize: number }> {
    const currentLock = await this.blockchain.getWriterValueTimeLock();
    const writerMaxBatchSize = BatchWriter.getNumberOfOperationsAllowed(this.versionManager, currentLock);

    return { writerMaxBatchSize };
  }

  /**
   * Gets the last processed transaction.
   */
  public async getLastProcessedTransaction (): Promise<TransactionModel | undefined> {
    const lastProcessedTransaction = await this.transactionStore.getLastTransaction();

    return lastProcessedTransaction;
  }
}
