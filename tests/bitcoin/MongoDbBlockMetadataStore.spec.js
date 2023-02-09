"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const BlockMetadataGenerator_1 = require("../generators/BlockMetadataGenerator");
const mongodb_1 = require("mongodb");
const MongoDb_1 = require("../common/MongoDb");
const MongoDbBlockMetadataStore_1 = require("../../lib/bitcoin/MongoDbBlockMetadataStore");
function createBlockMetadataStore(storeUri, databaseName) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const store = new MongoDbBlockMetadataStore_1.default(storeUri, databaseName);
        yield store.initialize();
        return store;
    });
}
describe('MongoDbBlockMetadataStore', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const config = require('../json/config-test.json');
    const databaseName = 'sidetree-test';
    let blockMetadataStore;
    beforeAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield MongoDb_1.default.createInmemoryDb(config);
        blockMetadataStore = yield createBlockMetadataStore(config.mongoDbConnectionString, databaseName);
    }));
    beforeEach(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield blockMetadataStore.clearCollection();
    }));
    it('should add and get metadata of blocks correctly.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const block1 = { hash: '1', height: 1, previousHash: '1', totalFee: 1, transactionCount: 1, normalizedFee: 1 };
        const block2 = { hash: '2', height: 2, previousHash: '2', totalFee: 2, transactionCount: 2, normalizedFee: 1 };
        const block3 = { hash: '3', height: 3, previousHash: '3', totalFee: 3, transactionCount: 3, normalizedFee: 1 };
        yield blockMetadataStore.add([block2, block3, block1]);
        let actualBlocks = yield blockMetadataStore.get(1, 4);
        expect(actualBlocks.length).toEqual(3);
        expect(actualBlocks[0].height).toEqual(1);
        expect(actualBlocks[1].height).toEqual(2);
        expect(actualBlocks[2].height).toEqual(3);
        actualBlocks = yield blockMetadataStore.get(2, 3);
        expect(actualBlocks.length).toEqual(1);
        expect(actualBlocks[0].height).toEqual(2);
        done();
    }));
    describe('initialize()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should create collection on initialization if it does not exist.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const client = yield mongodb_1.MongoClient.connect(config.mongoDbConnectionString);
            const db = client.db(databaseName);
            yield db.dropCollection(MongoDbBlockMetadataStore_1.default.collectionName);
            let collections = yield db.collections();
            let collectionNames = collections.map(collection => collection.collectionName);
            expect(collectionNames.includes(MongoDbBlockMetadataStore_1.default.collectionName)).toBeFalsy();
            yield blockMetadataStore.initialize();
            collections = yield db.collections();
            collectionNames = collections.map(collection => collection.collectionName);
            expect(collectionNames.includes(MongoDbBlockMetadataStore_1.default.collectionName)).toBeTruthy();
            done();
        }));
    }));
    describe('removeLaterThan()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should remove only data later than the specified height.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const block1 = { hash: 'hash1', height: 1, previousHash: '1', totalFee: 1, transactionCount: 1, normalizedFee: 1 };
            const block2 = { hash: 'hash2', height: 2, previousHash: '2', totalFee: 2, transactionCount: 2, normalizedFee: 1 };
            const block3 = { hash: 'hash3', height: 3, previousHash: '3', totalFee: 3, transactionCount: 3, normalizedFee: 1 };
            yield blockMetadataStore.add([block2, block3, block1]);
            yield blockMetadataStore.removeLaterThan(block1.height);
            const blocks = yield blockMetadataStore.get(1, 4);
            expect(blocks.length).toEqual(1);
            expect(blocks[0].hash).toEqual('hash1');
            done();
        }));
        it('should remove all if no height is given', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const blocks = BlockMetadataGenerator_1.default.generate(10);
            yield blockMetadataStore.add(blocks);
            yield blockMetadataStore.removeLaterThan();
            const returnedblocks = yield blockMetadataStore.get(0, 10);
            expect(returnedblocks.length).toEqual(0);
            done();
        }));
    }));
    describe('getLast()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should get block metadata with the largest height.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const block1 = { hash: '1', height: 1, previousHash: '1', totalFee: 1, transactionCount: 1, normalizedFee: 1 };
            const block2 = { hash: '2', height: 2, previousHash: '2', totalFee: 2, transactionCount: 2, normalizedFee: 1 };
            const block3 = { hash: '3', height: 3, previousHash: '3', totalFee: 3, transactionCount: 3, normalizedFee: 1 };
            yield blockMetadataStore.add([block2, block3, block1]);
            const lastBlock = yield blockMetadataStore.getLast();
            expect(lastBlock.height).toEqual(block3.height);
            done();
        }));
        it('should return `undefined` if block metadata store is emtpy.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const lastBlock = yield blockMetadataStore.getLast();
            expect(lastBlock).toBeUndefined();
            done();
        }));
    }));
    describe('getFirst()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should get block metadata with the largest height.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const block1 = { hash: '1', height: 1, previousHash: '1', totalFee: 1, transactionCount: 1, normalizedFee: 1 };
            const block2 = { hash: '2', height: 2, previousHash: '2', totalFee: 2, transactionCount: 2, normalizedFee: 1 };
            const block3 = { hash: '3', height: 3, previousHash: '3', totalFee: 3, transactionCount: 3, normalizedFee: 1 };
            yield blockMetadataStore.add([block2, block3, block1]);
            const firstBlock = yield blockMetadataStore.getFirst();
            expect(firstBlock.height).toEqual(block1.height);
            done();
        }));
        it('should return `undefined` if block metadata store is emtpy.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const firstBlock = yield blockMetadataStore.getFirst();
            expect(firstBlock).toBeUndefined();
            done();
        }));
    }));
    describe('lookBackExponentially()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should get block metadata with the largest height.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const blocks = BlockMetadataGenerator_1.default.generate(10);
            yield blockMetadataStore.add(blocks);
            const expectedExponentiallySpacedBlocks = [blocks[9], blocks[8], blocks[7], blocks[5], blocks[1]];
            const actualExponentiallySpacedBlocks = yield blockMetadataStore.lookBackExponentially();
            expect(actualExponentiallySpacedBlocks).toEqual(expectedExponentiallySpacedBlocks);
            done();
        }));
        it('should return empty array if block metadata store is emtpy.', (done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const actualExponentiallySpacedBlocks = yield blockMetadataStore.lookBackExponentially();
            expect(actualExponentiallySpacedBlocks).toEqual([]);
            done();
        }));
    }));
}));
//# sourceMappingURL=MongoDbBlockMetadataStore.spec.js.map