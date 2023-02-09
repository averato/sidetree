"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const BatchWriter_1 = require("./versions/latest/BatchWriter");
const MongoDbOperationQueue_1 = require("./versions/latest/MongoDbOperationQueue");
const MongoDbTransactionStore_1 = require("../common/MongoDbTransactionStore");
class Monitor {
    constructor(config, versionManager, blockchain) {
        this.operationQueue = new MongoDbOperationQueue_1.default(config.mongoDbConnectionString, config.databaseName);
        this.transactionStore = new MongoDbTransactionStore_1.default(config.mongoDbConnectionString, config.databaseName);
        this.blockchain = blockchain;
        this.versionManager = versionManager;
    }
    initialize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.transactionStore.initialize();
            yield this.operationQueue.initialize();
        });
    }
    getOperationQueueSize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const operationQueueSize = yield this.operationQueue.getSize();
            return { operationQueueSize };
        });
    }
    getWriterMaxBatchSize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const currentLock = yield this.blockchain.getWriterValueTimeLock();
            const writerMaxBatchSize = BatchWriter_1.default.getNumberOfOperationsAllowed(this.versionManager, currentLock);
            return { writerMaxBatchSize };
        });
    }
    getLastProcessedTransaction() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const lastProcessedTransaction = yield this.transactionStore.getLastTransaction();
            return lastProcessedTransaction;
        });
    }
}
exports.default = Monitor;
//# sourceMappingURL=Monitor.js.map