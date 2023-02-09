/// <reference types="node" />
import { ISidetreeCas, ISidetreeEventEmitter, ISidetreeLogger } from '..';
import Config from './models/Config';
import IBlockchain from './interfaces/IBlockchain';
import Monitor from './Monitor';
import ResponseModel from '../common/models/ResponseModel';
import VersionModel from './models/VersionModel';
export default class Core {
    private config;
    private cas;
    private blockchain;
    monitor: Monitor;
    private serviceStateStore;
    private transactionStore;
    private unresolvableTransactionStore;
    private operationStore;
    private versionManager;
    private downloadManager;
    private observer;
    private batchScheduler;
    private resolver;
    private serviceInfo;
    private blockchainClock;
    private confirmationStore;
    constructor(config: Config, versionModels: VersionModel[], cas: ISidetreeCas, blockchain?: IBlockchain);
    initialize(customLogger?: ISidetreeLogger, customEventEmitter?: ISidetreeEventEmitter): Promise<void>;
    private initializeDataStores;
    handleOperationRequest(request: Buffer): Promise<ResponseModel>;
    handleResolveRequest(didOrDidDocument: string): Promise<ResponseModel>;
    handleGetVersionRequest(): Promise<ResponseModel>;
    private upgradeDatabaseIfNeeded;
}
