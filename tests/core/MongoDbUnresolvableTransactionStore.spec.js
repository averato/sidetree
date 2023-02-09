"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongodb_1 = require("mongodb");
const MongoDb_1 = require("../common/MongoDb");
const MongoDbUnresolvableTransactionStore_1 = require("../../lib/core/MongoDbUnresolvableTransactionStore");
function createIUnresolvableTransactionStore(transactionStoreUri, databaseName) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const unresolvableTransactionStore = new MongoDbUnresolvableTransactionStore_1.default(transactionStoreUri, databaseName, 1);
        yield unresolvableTransactionStore.initialize();
        return unresolvableTransactionStore;
    });
}
function generateTransactions(count) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const transactions = [];
        for (let i = 1; i <= count; i++) {
            const transaction = {
                anchorString: i.toString(),
                transactionNumber: i,
                transactionTime: i,
                transactionTimeHash: i.toString(),
                transactionFeePaid: 1,
                normalizedTransactionFee: 1,
                writer: 'writer'
            };
            transactions.push(transaction);
        }
        return transactions;
    });
}
function verifyUnresolvableTransactionModel(actual, expected) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const actualCopy = Object.assign({}, actual);
        delete actualCopy._id;
        delete actualCopy.firstFetchTime;
        delete actualCopy.nextRetryTime;
        delete actualCopy.retryAttempts;
        expect(actualCopy).toEqual(expected);
    });
}
describe('MongoDbUnresolvableTransactionStore', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const config = require('../json/config-test.json');
    const databaseName = 'sidetree-test';
    let store;
    beforeAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield MongoDb_1.default.createInmemoryDb(config);
        store = yield createIUnresolvableTransactionStore(config.mongoDbConnectionString, databaseName);
    }));
    beforeEach(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield store.clearCollection();
    }));
    it('should create collection needed on initialization if they do not exist.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        console.info(`Deleting collections...`);
        const client = yield mongodb_1.MongoClient.connect(config.mongoDbConnectionString);
        const db = client.db(databaseName);
        yield db.dropCollection(MongoDbUnresolvableTransactionStore_1.default.unresolvableTransactionCollectionName);
        console.info(`Verify collections no longer exist.`);
        let collections = yield db.collections();
        let collectionNames = collections.map(collection => collection.collectionName);
        expect(collectionNames.includes(MongoDbUnresolvableTransactionStore_1.default.unresolvableTransactionCollectionName)).toBeFalsy();
        console.info(`Trigger initialization.`);
        yield store.initialize();
        console.info(`Verify collection exists now.`);
        collections = yield db.collections();
        collectionNames = collections.map(collection => collection.collectionName);
        expect(collectionNames.includes(MongoDbUnresolvableTransactionStore_1.default.unresolvableTransactionCollectionName)).toBeTruthy();
    }));
    it('should record and update unresolvable transactions', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 10;
        const transactions = yield generateTransactions(transactionCount);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[0]);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[1]);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[2]);
        let unresolvableTransactions = yield store.getUnresolvableTransactions();
        expect(unresolvableTransactions.length).toEqual(3);
        verifyUnresolvableTransactionModel(unresolvableTransactions[0], transactions[0]);
        verifyUnresolvableTransactionModel(unresolvableTransactions[1], transactions[1]);
        verifyUnresolvableTransactionModel(unresolvableTransactions[2], transactions[2]);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[0]);
        unresolvableTransactions = yield store.getUnresolvableTransactions();
        expect(unresolvableTransactions.length).toEqual(3);
        expect(unresolvableTransactions[0].retryAttempts).toEqual(1);
    }));
    it('should be able to remove an existing unresolvable transactions', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 10;
        const transactions = yield generateTransactions(transactionCount);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[0]);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[1]);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[2]);
        let unresolvableTransactions = yield store.getUnresolvableTransactions();
        expect(unresolvableTransactions.length).toEqual(3);
        yield store.removeUnresolvableTransaction(transactions[1]);
        unresolvableTransactions = yield store.getUnresolvableTransactions();
        expect(unresolvableTransactions.length).toEqual(2);
        const unresolvableTransactionNumbers = unresolvableTransactions.map(transaction => transaction.transactionNumber);
        expect(unresolvableTransactionNumbers.includes(2)).toBeFalsy();
    }));
    it('should be able to limit the number of unresolvable transactions returned for processing retry.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 10;
        const transactions = yield generateTransactions(transactionCount);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[0]);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[1]);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[2]);
        let unresolvableTransactions = yield store.getUnresolvableTransactions();
        expect(unresolvableTransactions.length).toEqual(3);
        const maxReturnCount = 2;
        let unresolvableTransactionsDueForRetry = yield store.getUnresolvableTransactionsDueForRetry(maxReturnCount);
        expect(unresolvableTransactionsDueForRetry.length).toEqual(2);
        for (const transaction of unresolvableTransactionsDueForRetry) {
            yield store.removeUnresolvableTransaction(transaction);
        }
        unresolvableTransactions = yield store.getUnresolvableTransactions();
        expect(unresolvableTransactions.length).toEqual(1);
        unresolvableTransactionsDueForRetry = yield store.getUnresolvableTransactionsDueForRetry();
        expect(unresolvableTransactionsDueForRetry.length).toEqual(1);
        for (const transaction of unresolvableTransactionsDueForRetry) {
            yield store.removeUnresolvableTransaction(transaction);
        }
        unresolvableTransactions = yield store.getUnresolvableTransactions();
        expect(unresolvableTransactions.length).toEqual(0);
    }));
    it('should be able to delete transactions greater than a given transaction time.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 10;
        const transactions = yield generateTransactions(transactionCount);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[3]);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[4]);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[5]);
        yield store.removeUnresolvableTransactionsLaterThan(5);
        const unresolvableTransactions = yield store.getUnresolvableTransactions();
        expect(unresolvableTransactions.length).toEqual(2);
        const unresolvableTransactionNumbers = unresolvableTransactions.map(transaction => transaction.transactionNumber);
        expect(unresolvableTransactionNumbers.includes(4)).toBeTruthy();
        expect(unresolvableTransactionNumbers.includes(5)).toBeTruthy();
    }));
    it('should be able to delete all transactions.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 10;
        const transactions = yield generateTransactions(transactionCount);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[3]);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[4]);
        yield store.recordUnresolvableTransactionFetchAttempt(transactions[5]);
        yield store.removeUnresolvableTransactionsLaterThan();
        const unresolvableTransactions = yield store.getUnresolvableTransactions();
        expect(unresolvableTransactions.length).toEqual(0);
    }));
}));
//# sourceMappingURL=MongoDbUnresolvableTransactionStore.spec.js.map