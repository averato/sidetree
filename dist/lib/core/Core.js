"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const semver = require("semver");
const timeSpan = require("time-span");
const BatchScheduler_1 = require("./BatchScheduler");
const Blockchain_1 = require("./Blockchain");
const BlockchainClock_1 = require("./BlockchainClock");
const DownloadManager_1 = require("./DownloadManager");
const ErrorCode_1 = require("./ErrorCode");
const EventEmitter_1 = require("../common/EventEmitter");
const LogColor_1 = require("../common/LogColor");
const Logger_1 = require("../common/Logger");
const MongoDbConfirmationStore_1 = require("./MongoDbConfirmationStore");
const MongoDbOperationStore_1 = require("./MongoDbOperationStore");
const MongoDbServiceStateStore_1 = require("../common/MongoDbServiceStateStore");
const MongoDbTransactionStore_1 = require("../common/MongoDbTransactionStore");
const MongoDbUnresolvableTransactionStore_1 = require("./MongoDbUnresolvableTransactionStore");
const Monitor_1 = require("./Monitor");
const Observer_1 = require("./Observer");
const Resolver_1 = require("./Resolver");
const ResponseStatus_1 = require("../common/enums/ResponseStatus");
const ServiceInfoProvider_1 = require("../common/ServiceInfoProvider");
const SidetreeError_1 = require("../common/SidetreeError");
const VersionManager_1 = require("./VersionManager");
class Core {
    constructor(config, versionModels, cas, blockchain = new Blockchain_1.default(config.blockchainServiceUri)) {
        this.config = config;
        this.cas = cas;
        this.blockchain = blockchain;
        this.versionManager = new VersionManager_1.default(config, versionModels);
        this.serviceInfo = new ServiceInfoProvider_1.default('core');
        this.serviceStateStore = new MongoDbServiceStateStore_1.default(this.config.mongoDbConnectionString, this.config.databaseName);
        this.operationStore = new MongoDbOperationStore_1.default(config.mongoDbConnectionString, config.databaseName);
        this.downloadManager = new DownloadManager_1.default(config.maxConcurrentDownloads, this.cas);
        this.resolver = new Resolver_1.default(this.versionManager, this.operationStore);
        this.transactionStore = new MongoDbTransactionStore_1.default(config.mongoDbConnectionString, config.databaseName);
        this.unresolvableTransactionStore = new MongoDbUnresolvableTransactionStore_1.default(config.mongoDbConnectionString, config.databaseName);
        this.confirmationStore = new MongoDbConfirmationStore_1.default(config.mongoDbConnectionString, config.databaseName);
        const enableRealBlockchainTimePull = config.observingIntervalInSeconds > 0;
        this.blockchainClock = new BlockchainClock_1.default(this.blockchain, this.serviceStateStore, enableRealBlockchainTimePull);
        this.batchScheduler = new BatchScheduler_1.default(this.versionManager, this.blockchain, config.batchingIntervalInSeconds);
        this.observer = new Observer_1.default(this.versionManager, this.blockchain, config.maxConcurrentDownloads, this.operationStore, this.transactionStore, this.unresolvableTransactionStore, this.confirmationStore, config.observingIntervalInSeconds);
        this.monitor = new Monitor_1.default(this.config, this.versionManager, this.blockchain);
    }
    initialize(customLogger, customEventEmitter) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.initialize(customLogger);
            EventEmitter_1.default.initialize(customEventEmitter);
            yield this.initializeDataStores(this.config.observingIntervalInSeconds);
            yield this.versionManager.initialize(this.blockchain, this.cas, this.downloadManager, this.operationStore, this.resolver, this.transactionStore, this.confirmationStore);
            if (this.config.observingIntervalInSeconds > 0) {
                yield this.observer.startPeriodicProcessing();
            }
            else {
                Logger_1.default.warn(LogColor_1.default.yellow(`Transaction observer is disabled.`));
            }
            yield this.blockchainClock.startPeriodicPullLatestBlockchainTime();
            if (this.config.batchingIntervalInSeconds > 0) {
                this.batchScheduler.startPeriodicBatchWriting();
            }
            else {
                Logger_1.default.warn(LogColor_1.default.yellow(`Batch writing is disabled.`));
            }
            this.downloadManager.start();
            yield this.monitor.initialize();
        });
    }
    initializeDataStores(retryWaitTimeOnFailureInSeconds) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            while (true) {
                try {
                    yield this.serviceStateStore.initialize();
                    yield this.transactionStore.initialize();
                    yield this.unresolvableTransactionStore.initialize();
                    yield this.operationStore.initialize();
                    yield this.confirmationStore.initialize();
                    yield this.upgradeDatabaseIfNeeded();
                    return;
                }
                catch (error) {
                    Logger_1.default.info(LogColor_1.default.yellow(`Unable to initialize data stores: ${error}.`));
                }
                Logger_1.default.info(`Retry data store initialization after ${retryWaitTimeOnFailureInSeconds} seconds...`);
                yield new Promise(resolve => setTimeout(resolve, retryWaitTimeOnFailureInSeconds * 1000));
            }
        });
    }
    handleOperationRequest(request) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const currentTime = this.blockchainClock.getTime();
            const requestHandler = this.versionManager.getRequestHandler(currentTime);
            const response = requestHandler.handleOperationRequest(request);
            return response;
        });
    }
    handleResolveRequest(didOrDidDocument) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const currentTime = this.blockchainClock.getTime();
            const requestHandler = this.versionManager.getRequestHandler(currentTime);
            const response = requestHandler.handleResolveRequest(didOrDidDocument);
            return response;
        });
    }
    handleGetVersionRequest() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const responses = [
                this.serviceInfo.getServiceVersion(),
                yield this.blockchain.getServiceVersion()
            ];
            return {
                status: ResponseStatus_1.default.Succeeded,
                body: JSON.stringify(responses)
            };
        });
    }
    upgradeDatabaseIfNeeded() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.config.observingIntervalInSeconds === 0) {
                return;
            }
            const expectedDbVersion = '1.1.0';
            const savedServiceState = yield this.serviceStateStore.get();
            const actualDbVersion = savedServiceState.databaseVersion;
            if (expectedDbVersion === actualDbVersion) {
                return;
            }
            if (actualDbVersion !== undefined && semver.lt(expectedDbVersion, actualDbVersion)) {
                Logger_1.default.error(LogColor_1.default.red(`Downgrading DB from version ${LogColor_1.default.green(actualDbVersion)} to  ${LogColor_1.default.green(expectedDbVersion)} is not allowed.`));
                throw new SidetreeError_1.default(ErrorCode_1.default.DatabaseDowngradeNotAllowed);
            }
            Logger_1.default.warn(LogColor_1.default.yellow(`Upgrading DB from version ${LogColor_1.default.green(actualDbVersion)} to ${LogColor_1.default.green(expectedDbVersion)}...`));
            const timer = timeSpan();
            yield this.operationStore.delete();
            yield this.transactionStore.clearCollection();
            yield this.unresolvableTransactionStore.clearCollection();
            yield this.operationStore.createIndex();
            yield this.serviceStateStore.put({ databaseVersion: expectedDbVersion });
            Logger_1.default.warn(LogColor_1.default.yellow(`DB upgraded in: ${LogColor_1.default.green(timer.rounded())} ms.`));
        });
    }
}
exports.default = Core;
//# sourceMappingURL=Core.js.map