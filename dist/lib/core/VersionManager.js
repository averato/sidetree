"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const AbstractVersionMetadata_1 = tslib_1.__importDefault(require("./abstracts/AbstractVersionMetadata"));
const ErrorCode_1 = tslib_1.__importDefault(require("./ErrorCode"));
const SidetreeError_1 = tslib_1.__importDefault(require("../common/SidetreeError"));
class VersionManager {
    constructor(config, versions) {
        this.config = config;
        this.versionsReverseSorted = versions.sort((a, b) => b.startingBlockchainTime - a.startingBlockchainTime);
        this.batchWriters = new Map();
        this.operationProcessors = new Map();
        this.requestHandlers = new Map();
        this.transactionProcessors = new Map();
        this.transactionSelectors = new Map();
        this.versionMetadatas = new Map();
    }
    initialize(blockchain, cas, downloadManager, operationStore, resolver, transactionStore, confirmationStore) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const versionModel of this.versionsReverseSorted) {
                const version = versionModel.version;
                const MongoDbOperationQueue = yield this.loadDefaultExportsForVersion(version, 'MongoDbOperationQueue');
                const operationQueue = new MongoDbOperationQueue(this.config.mongoDbConnectionString, this.config.databaseName);
                yield operationQueue.initialize();
                const TransactionProcessor = yield this.loadDefaultExportsForVersion(version, 'TransactionProcessor');
                const transactionProcessor = new TransactionProcessor(downloadManager, operationStore, blockchain, this);
                this.transactionProcessors.set(version, transactionProcessor);
                const TransactionSelector = yield this.loadDefaultExportsForVersion(version, 'TransactionSelector');
                const transactionSelector = new TransactionSelector(transactionStore);
                this.transactionSelectors.set(version, transactionSelector);
                const BatchWriter = yield this.loadDefaultExportsForVersion(version, 'BatchWriter');
                const batchWriter = new BatchWriter(operationQueue, blockchain, cas, this, confirmationStore);
                this.batchWriters.set(version, batchWriter);
                const OperationProcessor = yield this.loadDefaultExportsForVersion(version, 'OperationProcessor');
                const operationProcessor = new OperationProcessor();
                this.operationProcessors.set(version, operationProcessor);
                const RequestHandler = yield this.loadDefaultExportsForVersion(version, 'RequestHandler');
                const requestHandler = new RequestHandler(resolver, operationQueue, this.config.didMethodName);
                this.requestHandlers.set(version, requestHandler);
                const VersionMetadata = yield this.loadDefaultExportsForVersion(version, 'VersionMetadata');
                const versionMetadata = new VersionMetadata();
                if (!(versionMetadata instanceof AbstractVersionMetadata_1.default)) {
                    throw new SidetreeError_1.default(ErrorCode_1.default.VersionManagerVersionMetadataIncorrectType, `make sure VersionMetaData is properly implemented for version ${version}`);
                }
                this.versionMetadatas.set(version, versionMetadata);
            }
        });
    }
    getBatchWriter(blockchainTime) {
        const version = this.getVersionString(blockchainTime);
        const batchWriter = this.batchWriters.get(version);
        return batchWriter;
    }
    getOperationProcessor(blockchainTime) {
        const version = this.getVersionString(blockchainTime);
        const operationProcessor = this.operationProcessors.get(version);
        return operationProcessor;
    }
    getRequestHandler(blockchainTime) {
        const version = this.getVersionString(blockchainTime);
        const requestHandler = this.requestHandlers.get(version);
        return requestHandler;
    }
    getTransactionProcessor(blockchainTime) {
        const version = this.getVersionString(blockchainTime);
        const transactionProcessor = this.transactionProcessors.get(version);
        return transactionProcessor;
    }
    getTransactionSelector(blockchainTime) {
        const version = this.getVersionString(blockchainTime);
        const transactionSelector = this.transactionSelectors.get(version);
        return transactionSelector;
    }
    getVersionMetadata(blockchainTime) {
        const versionString = this.getVersionString(blockchainTime);
        const versionMetadata = this.versionMetadatas.get(versionString);
        return versionMetadata;
    }
    getVersionString(blockchainTime) {
        for (const versionModel of this.versionsReverseSorted) {
            if (blockchainTime >= versionModel.startingBlockchainTime) {
                return versionModel.version;
            }
        }
        throw new SidetreeError_1.default(ErrorCode_1.default.VersionManagerVersionStringNotFound, `Unable to find version string for blockchain time ${blockchainTime}.`);
    }
    loadDefaultExportsForVersion(version, className) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a;
            const defaults = (yield (_a = `./versions/${version}/${className}`, Promise.resolve().then(() => tslib_1.__importStar(require(_a))))).default;
            return defaults;
        });
    }
}
exports.default = VersionManager;
//# sourceMappingURL=VersionManager.js.map