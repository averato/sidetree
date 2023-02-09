"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const MongoDbStore_1 = require("../common/MongoDbStore");
class MongoDbBlockMetadataStore extends MongoDbStore_1.default {
    constructor(serverUrl, databaseName) {
        super(serverUrl, MongoDbBlockMetadataStore.collectionName, databaseName);
    }
    createIndex() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.collection.createIndex({ height: 1 }, { unique: true });
        });
    }
    add(arrayOfBlockMetadata) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bulkOperations = this.collection.initializeOrderedBulkOp();
            arrayOfBlockMetadata.sort((a, b) => a.height - b.height);
            for (const blockMetadata of arrayOfBlockMetadata) {
                bulkOperations.find({ height: blockMetadata.height }).upsert().replaceOne(blockMetadata);
            }
            yield bulkOperations.execute();
        });
    }
    removeLaterThan(blockHeight) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (blockHeight === undefined) {
                yield this.clearCollection();
                return;
            }
            yield this.collection.deleteMany({ height: { $gt: blockHeight } });
        });
    }
    get(fromInclusiveHeight, toExclusiveHeight) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let dbCursor;
            dbCursor = this.collection.find({
                $and: [
                    { height: { $gte: fromInclusiveHeight } },
                    { height: { $lt: toExclusiveHeight } }
                ]
            });
            dbCursor = dbCursor.sort({ height: 1 });
            const blocks = yield dbCursor.toArray();
            return blocks;
        });
    }
    getLast() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const blocks = yield this.collection.find().sort({ height: -1 }).limit(1).toArray();
            if (blocks.length === 0) {
                return undefined;
            }
            const lastBlockMetadata = blocks[0];
            return lastBlockMetadata;
        });
    }
    getFirst() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const blocks = yield this.collection.find().sort({ height: 1 }).limit(1).toArray();
            if (blocks.length === 0) {
                return undefined;
            }
            const lastBlockMetadata = blocks[0];
            return lastBlockMetadata;
        });
    }
    lookBackExponentially() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const lastBlock = yield this.getLast();
            const firstBlock = yield this.getFirst();
            if (firstBlock === undefined) {
                return [];
            }
            const heightOfBlocksToReturn = [];
            let lookBackDistance = 1;
            let currentHeight = lastBlock.height;
            while (currentHeight >= firstBlock.height) {
                heightOfBlocksToReturn.push(currentHeight);
                currentHeight = lastBlock.height - lookBackDistance;
                lookBackDistance *= 2;
            }
            const exponentiallySpacedBlocks = yield this.collection.find({ height: { $in: heightOfBlocksToReturn } }, MongoDbBlockMetadataStore.optionToExcludeIdField).toArray();
            exponentiallySpacedBlocks.sort((a, b) => b.height - a.height);
            return exponentiallySpacedBlocks;
        });
    }
}
exports.default = MongoDbBlockMetadataStore;
MongoDbBlockMetadataStore.collectionName = 'blocks';
MongoDbBlockMetadataStore.optionToExcludeIdField = { fields: { _id: 0 } };
//# sourceMappingURL=MongoDbBlockMetadataStore.js.map