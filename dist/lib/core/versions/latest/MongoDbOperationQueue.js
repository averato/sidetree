"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongodb_1 = require("mongodb");
const ErrorCode_1 = tslib_1.__importDefault(require("./ErrorCode"));
const MongoDbStore_1 = tslib_1.__importDefault(require("../../../common/MongoDbStore"));
const SidetreeError_1 = tslib_1.__importDefault(require("../../../common/SidetreeError"));
class MongoDbOperationQueue extends MongoDbStore_1.default {
    constructor(serverUrl, databaseName) {
        super(serverUrl, MongoDbOperationQueue.collectionName, databaseName);
    }
    createIndex() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.collection.createIndex({ didUniqueSuffix: 1 }, { unique: true });
        });
    }
    enqueue(didUniqueSuffix, operationBuffer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const queuedOperation = {
                    didUniqueSuffix,
                    operationBufferBsonBinary: new mongodb_1.Binary(operationBuffer)
                };
                yield this.collection.insertOne(queuedOperation);
            }
            catch (error) {
                if (error instanceof SidetreeError_1.default && error.code === '11000') {
                    throw new SidetreeError_1.default(ErrorCode_1.default.BatchWriterAlreadyHasOperationForDid);
                }
                throw error;
            }
        });
    }
    dequeue(count) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (count <= 0) {
                return [];
            }
            const queuedOperations = yield this.collection.find().sort({ _id: 1 }).limit(count).toArray();
            const lastOperation = queuedOperations[queuedOperations.length - 1];
            yield this.collection.deleteMany({ _id: { $lte: lastOperation._id } });
            return queuedOperations.map((operation) => MongoDbOperationQueue.convertToQueuedOperationModel(operation));
        });
    }
    peek(count) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (count <= 0) {
                return [];
            }
            const queuedOperations = yield this.collection.find().sort({ _id: 1 }).limit(count).toArray();
            return queuedOperations.map((operation) => MongoDbOperationQueue.convertToQueuedOperationModel(operation));
        });
    }
    contains(didUniqueSuffix) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const operations = yield this.collection.find({ didUniqueSuffix }).limit(1).toArray();
            return operations.length > 0;
        });
    }
    getSize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const size = yield this.collection.estimatedDocumentCount();
            return size;
        });
    }
    static convertToQueuedOperationModel(mongoQueuedOperation) {
        return {
            didUniqueSuffix: mongoQueuedOperation.didUniqueSuffix,
            operationBuffer: Buffer.from(mongoQueuedOperation.operationBufferBsonBinary.buffer)
        };
    }
}
exports.default = MongoDbOperationQueue;
MongoDbOperationQueue.collectionName = 'queued-operations';
//# sourceMappingURL=MongoDbOperationQueue.js.map