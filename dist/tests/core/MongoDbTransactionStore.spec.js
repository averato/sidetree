"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongodb_1 = require("mongodb");
const MongoDb_1 = require("../common/MongoDb");
const MongoDbTransactionStore_1 = require("../../lib/common/MongoDbTransactionStore");
function createTransactionStore(transactionStoreUri, databaseName) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const transactionStore = new MongoDbTransactionStore_1.default(transactionStoreUri, databaseName);
        yield transactionStore.initialize();
        return transactionStore;
    });
}
function generateAndStoreTransactions(transactionStore, count) {
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
            yield transactionStore.addTransaction(transaction);
            transactions.push(transaction);
        }
        return transactions;
    });
}
describe('MongoDbTransactionStore', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const config = require('../json/config-test.json');
    const databaseName = 'sidetree-test';
    let transactionStore;
    beforeAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield MongoDb_1.default.createInmemoryDb(config);
        transactionStore = yield createTransactionStore(config.mongoDbConnectionString, databaseName);
    }));
    beforeEach(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield transactionStore.clearCollection();
    }));
    it('should throw error if addTransaction throws a non 11000 error', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        spyOn(transactionStore['collection'], 'insertOne').and.throwError('Expected test error');
        try {
            yield transactionStore.addTransaction({
                transactionNumber: 1,
                transactionTime: 1,
                transactionFeePaid: 1,
                transactionTimeHash: 'hash',
                anchorString: 'anchorString',
                writer: 'writer'
            });
            fail('expected to throw but did not');
        }
        catch (error) {
            expect(error).toEqual(new Error('Expected test error'));
        }
    }));
    it('should create collections needed on initialization if they do not exist.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        console.info(`Deleting collections...`);
        const client = yield mongodb_1.MongoClient.connect(config.mongoDbConnectionString);
        const db = client.db(databaseName);
        yield db.dropCollection(MongoDbTransactionStore_1.default.transactionCollectionName);
        console.info(`Verify collections no longer exist.`);
        let collections = yield db.collections();
        let collectionNames = collections.map(collection => collection.collectionName);
        expect(collectionNames.includes(MongoDbTransactionStore_1.default.transactionCollectionName)).toBeFalsy();
        console.info(`Trigger initialization.`);
        yield transactionStore.initialize();
        console.info(`Verify collection exists now.`);
        collections = yield db.collections();
        collectionNames = collections.map(collection => collection.collectionName);
        expect(collectionNames.includes(MongoDbTransactionStore_1.default.transactionCollectionName)).toBeTruthy();
    }));
    it('should be able to fetch the count of transactions.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 3;
        yield generateAndStoreTransactions(transactionStore, transactionCount);
        const actualTransactionCount = yield transactionStore.getTransactionsCount();
        expect(actualTransactionCount).toEqual(transactionCount);
    }));
    it('should be able to fetch transaction by transaction number.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 3;
        yield generateAndStoreTransactions(transactionStore, transactionCount);
        const transaction = yield transactionStore.getTransaction(2);
        expect(transaction.transactionTime).toEqual(2);
    }));
    it('should return undefined if unable to find transaction of the given transaction number.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 3;
        yield generateAndStoreTransactions(transactionStore, transactionCount);
        const transaction = yield transactionStore.getTransaction(4);
        expect(transaction).toBeUndefined();
    }));
    it('should be able to fetch transactions later than a given transaction number.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 3;
        yield generateAndStoreTransactions(transactionStore, transactionCount);
        const transactions = yield transactionStore.getTransactionsLaterThan(1, 100);
        expect(transactions.length).toEqual(2);
        expect(transactions[0].transactionNumber).toEqual(2);
        expect(transactions[1].transactionNumber).toEqual(3);
    }));
    it('should return [] if error is thrown when fetching transactions later than a given transaction number', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 3;
        yield generateAndStoreTransactions(transactionStore, transactionCount);
        spyOn(transactionStore['collection'], 'find').and.throwError('expected test error');
        const transactions = yield transactionStore.getTransactionsLaterThan(1, 100);
        expect(transactions.length).toEqual(0);
    }));
    it('should fetch transactions from the start if transaction number is not given.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 3;
        yield generateAndStoreTransactions(transactionStore, transactionCount);
        const transactions = yield transactionStore.getTransactionsLaterThan(undefined, undefined);
        expect(transactions.length).toEqual(3);
        expect(transactions[0].transactionNumber).toEqual(1);
        expect(transactions[1].transactionNumber).toEqual(2);
        expect(transactions[2].transactionNumber).toEqual(3);
    }));
    it('should limit the transactions fetched if a limit is defined.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 3;
        yield generateAndStoreTransactions(transactionStore, transactionCount);
        const transactions = yield transactionStore.getTransactionsLaterThan(undefined, 2);
        expect(transactions.length).toEqual(2);
        expect(transactions[0].transactionNumber).toEqual(1);
        expect(transactions[1].transactionNumber).toEqual(2);
    }));
    it('should not store duplicated transactions.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 3;
        yield generateAndStoreTransactions(transactionStore, transactionCount);
        let transactions = yield transactionStore.getTransactions();
        expect(transactions.length).toEqual(transactionCount);
        yield generateAndStoreTransactions(transactionStore, transactionCount);
        transactions = yield transactionStore.getTransactions();
        expect(transactions.length).toEqual(transactionCount);
    }));
    it('should be able to get the last transaction.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 10;
        yield generateAndStoreTransactions(transactionStore, transactionCount);
        const lastTransaction = yield transactionStore.getLastTransaction();
        expect(lastTransaction).toBeDefined();
        expect(lastTransaction.transactionNumber).toEqual(transactionCount);
    }));
    it('should return undefined if there are no transactions when getting the last transaction.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const lastTransaction = yield transactionStore.getLastTransaction();
        expect(lastTransaction).toBeUndefined();
    }));
    it('should be able to return exponentially spaced transactions.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 8;
        yield generateAndStoreTransactions(transactionStore, transactionCount);
        const exponentiallySpacedTransactions = yield transactionStore.getExponentiallySpacedTransactions();
        expect(exponentiallySpacedTransactions.length).toEqual(4);
        expect(exponentiallySpacedTransactions[0].transactionNumber).toEqual(8);
        expect(exponentiallySpacedTransactions[1].transactionNumber).toEqual(7);
        expect(exponentiallySpacedTransactions[2].transactionNumber).toEqual(5);
        expect(exponentiallySpacedTransactions[3].transactionNumber).toEqual(1);
    }));
    it('should be able to delete transactions greater than a given transaction time.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 10;
        yield generateAndStoreTransactions(transactionStore, transactionCount);
        yield transactionStore.removeTransactionsLaterThan(5);
        const remainingTransactions = yield transactionStore.getTransactions();
        expect(remainingTransactions.length).toEqual(5);
        const remainingTransactionNumbers = remainingTransactions.map(transaction => transaction.transactionNumber);
        expect(remainingTransactionNumbers.includes(1)).toBeTruthy();
        expect(remainingTransactionNumbers.includes(2)).toBeTruthy();
        expect(remainingTransactionNumbers.includes(3)).toBeTruthy();
        expect(remainingTransactionNumbers.includes(4)).toBeTruthy();
        expect(remainingTransactionNumbers.includes(5)).toBeTruthy();
    }));
    it('should be able to delete transactions by transaction time hash', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactions = yield generateAndStoreTransactions(transactionStore, 10);
        const hashToDelete = transactions[0].transactionTimeHash;
        yield transactionStore.removeTransactionByTransactionTimeHash(hashToDelete);
        const remainingTransactions = yield transactionStore.getTransactions();
        expect(remainingTransactions.length).toEqual(9);
        for (const transaction of remainingTransactions) {
            expect(transaction.transactionTimeHash !== hashToDelete).toBeTruthy();
        }
    }));
    it('should be able to delete all transactions.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transactionCount = 10;
        yield generateAndStoreTransactions(transactionStore, transactionCount);
        yield transactionStore.removeTransactionsLaterThan();
        const remainingTransactions = yield transactionStore.getTransactions();
        expect(remainingTransactions.length).toEqual(0);
    }));
    it('should fetch transactions by 1 transactionTime when end time is the same as begin time', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transaction1 = {
            anchorString: 'string1',
            transactionNumber: 1,
            transactionTime: 1,
            transactionTimeHash: '1',
            transactionFeePaid: 1,
            normalizedTransactionFee: 1,
            writer: 'writer1'
        };
        const transaction2 = {
            anchorString: 'string2',
            transactionNumber: 2,
            transactionTime: 2,
            transactionTimeHash: '2',
            transactionFeePaid: 1,
            normalizedTransactionFee: 1,
            writer: 'writer2'
        };
        const transaction3 = {
            anchorString: 'string3',
            transactionNumber: 3,
            transactionTime: 2,
            transactionTimeHash: '2',
            transactionFeePaid: 1,
            normalizedTransactionFee: 1,
            writer: 'writer3'
        };
        yield transactionStore.addTransaction(transaction1);
        yield transactionStore.addTransaction(transaction2);
        yield transactionStore.addTransaction(transaction3);
        const result = yield transactionStore.getTransactionsStartingFrom(2, 2);
        expect(result.length).toEqual(2);
        expect(result[0].transactionNumber).toEqual(2);
        expect(result[1].transactionNumber).toEqual(3);
    }));
    it('should fetch transactions going forward in time when end time is greater than begin time', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transaction1 = {
            anchorString: 'string1',
            transactionNumber: 1,
            transactionTime: 1,
            transactionTimeHash: '1',
            transactionFeePaid: 1,
            normalizedTransactionFee: 1,
            writer: 'writer1'
        };
        const transaction2 = {
            anchorString: 'string2',
            transactionNumber: 2,
            transactionTime: 2,
            transactionTimeHash: '2',
            transactionFeePaid: 1,
            normalizedTransactionFee: 1,
            writer: 'writer2'
        };
        const transaction3 = {
            anchorString: 'string3',
            transactionNumber: 3,
            transactionTime: 3,
            transactionTimeHash: '3',
            transactionFeePaid: 1,
            normalizedTransactionFee: 1,
            writer: 'writer3'
        };
        yield transactionStore.addTransaction(transaction1);
        yield transactionStore.addTransaction(transaction2);
        yield transactionStore.addTransaction(transaction3);
        const result = yield transactionStore.getTransactionsStartingFrom(1, 3);
        expect(result.length).toEqual(2);
        expect(result[0].transactionNumber).toEqual(1);
        expect(result[1].transactionNumber).toEqual(2);
    }));
    it('should fetch no transactions if begin is greater than end', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const transaction1 = {
            anchorString: 'string1',
            transactionNumber: 1,
            transactionTime: 1,
            transactionTimeHash: '1',
            transactionFeePaid: 1,
            normalizedTransactionFee: 1,
            writer: 'writer1'
        };
        const transaction2 = {
            anchorString: 'string2',
            transactionNumber: 2,
            transactionTime: 2,
            transactionTimeHash: '2',
            transactionFeePaid: 1,
            normalizedTransactionFee: 1,
            writer: 'writer2'
        };
        const transaction3 = {
            anchorString: 'string3',
            transactionNumber: 3,
            transactionTime: 3,
            transactionTimeHash: '3',
            transactionFeePaid: 1,
            normalizedTransactionFee: 1,
            writer: 'writer3'
        };
        yield transactionStore.addTransaction(transaction1);
        yield transactionStore.addTransaction(transaction2);
        yield transactionStore.addTransaction(transaction3);
        const result = yield transactionStore.getTransactionsStartingFrom(3, 1);
        expect(result.length).toEqual(0);
    }));
}));
//# sourceMappingURL=MongoDbTransactionStore.spec.js.map