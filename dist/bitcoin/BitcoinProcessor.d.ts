import { ISidetreeEventEmitter, ISidetreeLogger } from '..';
import BitcoinVersionModel from './models/BitcoinVersionModel';
import IBitcoinConfig from './IBitcoinConfig';
import Monitor from './Monitor';
import ServiceVersionModel from '../common/models/ServiceVersionModel';
import TransactionFeeModel from '../common/models/TransactionFeeModel';
import TransactionModel from '../common/models/TransactionModel';
import ValueTimeLockModel from '../common/models/ValueTimeLockModel';
export interface IBlockchainTime {
    time: number;
    hash: string;
}
export interface IBlockInfo {
    height: number;
    hash: string;
    previousHash: string;
}
export default class BitcoinProcessor {
    private config;
    readonly genesisBlockNumber: number;
    monitor: Monitor;
    private readonly transactionStore;
    private versionManager;
    private lastProcessedBlock;
    private pollTimeoutId;
    private serviceInfoProvider;
    private bitcoinClient;
    private spendingMonitor;
    private serviceStateStore;
    private blockMetadataStore;
    private mongoDbLockTransactionStore;
    private lockResolver;
    private lockMonitor;
    private sidetreeTransactionParser;
    private static readonly pageSizeInBlocks;
    constructor(config: IBitcoinConfig);
    initialize(versionModels: BitcoinVersionModel[], customLogger?: ISidetreeLogger, customEventEmitter?: ISidetreeEventEmitter): Promise<void>;
    private upgradeDatabaseIfNeeded;
    private fastProcessTransactions;
    private processBlocks;
    private findEarliestValidBlockAndAddToValidBlocks;
    private removeTransactionsInInvalidBlocks;
    private static getBitcoinBlockTotalFee;
    private static getBitcoinBlockReward;
    private processSidetreeTransactionsInBlock;
    time(hash?: string): Promise<IBlockchainTime>;
    transactions(since?: number, hash?: string): Promise<{
        moreTransactions: boolean;
        transactions: TransactionModel[];
    }>;
    firstValidBlock(blocks: IBlockInfo[]): Promise<IBlockInfo | undefined>;
    firstValidTransaction(transactions: TransactionModel[]): Promise<TransactionModel | undefined>;
    writeTransaction(anchorString: string, minimumFee: number): Promise<void>;
    private writeBlocksToMetadataStoreWithFee;
    getNormalizedFee(block: number | string): Promise<TransactionFeeModel>;
    getServiceVersion(): Promise<ServiceVersionModel>;
    getValueTimeLock(lockIdentifier: string): Promise<ValueTimeLockModel>;
    getActiveValueTimeLockForThisNode(): Promise<ValueTimeLockModel>;
    static generatePrivateKeyForTestnet(): string;
    private periodicPoll;
    private processTransactions;
    private getStartingBlockForPeriodicPoll;
    private revertDatabases;
    private trimDatabasesToBlock;
    private verifyBlock;
    private processBlock;
    private getSidetreeTransactionModelIfExist;
    private getTransactionsSince;
}
