"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const DownloadManager_1 = require("../../lib/core/DownloadManager");
const ErrorCode_1 = require("../../lib/core/ErrorCode");
const MockBlockchain_1 = require("../mocks/MockBlockchain");
const MockCas_1 = require("../mocks/MockCas");
const MockConfirmationStore_1 = require("../mocks/MockConfirmationStore");
const MockOperationStore_1 = require("../mocks/MockOperationStore");
const MockTransactionStore_1 = require("../mocks/MockTransactionStore");
const OperationGenerator_1 = require("../generators/OperationGenerator");
const OperationType_1 = require("../../lib/core/enums/OperationType");
const Resolver_1 = require("../../lib/core/Resolver");
const VersionManager_1 = require("../../lib/core/VersionManager");
const SidetreeError_1 = require("../../lib/common/SidetreeError");
describe('VersionManager', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let config;
    let blockChain;
    let cas;
    let operationStore;
    let downloadMgr;
    let mockTransactionStore;
    let mockConfirmationStore;
    beforeEach(() => {
        config = require('../json/config-test.json');
        blockChain = new MockBlockchain_1.default();
        cas = new MockCas_1.default();
        operationStore = new MockOperationStore_1.default();
        downloadMgr = new DownloadManager_1.default(1, cas);
        mockTransactionStore = new MockTransactionStore_1.default();
        mockConfirmationStore = new MockConfirmationStore_1.default();
    });
    describe('initialize()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should initialize all the objects correctly.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const versionModels = [
                { startingBlockchainTime: 1000, version: 'test-version-1' }
            ];
            const versionMgr = new VersionManager_1.default(config, versionModels);
            spyOn(versionMgr, 'loadDefaultExportsForVersion').and.callFake((version, className) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                var _a;
                return (yield (_a = `./versions/${version}/${className}`, Promise.resolve().then(() => require(_a)))).default;
            }));
            const resolver = new Resolver_1.default(versionMgr, operationStore);
            yield versionMgr.initialize(blockChain, cas, downloadMgr, operationStore, resolver, mockTransactionStore, mockConfirmationStore);
            expect(versionMgr['batchWriters'].get('test-version-1')).toBeDefined();
            expect(versionMgr['transactionProcessors'].get('test-version-1')).toBeDefined();
        }));
        it('should throw if version metadata is the wrong type.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const versionModels = [
                { startingBlockchainTime: 1000, version: 'test-version-1' }
            ];
            const versionMgr = new VersionManager_1.default(config, versionModels);
            spyOn(versionMgr, 'loadDefaultExportsForVersion').and.callFake((version, className) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                var _b;
                if (className === 'VersionMetadata') {
                    const fakeClass = class {
                    };
                    return fakeClass;
                }
                else {
                    return (yield (_b = `./versions/${version}/${className}`, Promise.resolve().then(() => require(_b)))).default;
                }
            }));
            const resolver = new Resolver_1.default(versionMgr, operationStore);
            try {
                yield versionMgr.initialize(blockChain, cas, downloadMgr, operationStore, resolver, mockTransactionStore, mockConfirmationStore);
                fail('expect to throw but did not');
            }
            catch (e) {
                if (e instanceof SidetreeError_1.default)
                    expect(e.code).toEqual(ErrorCode_1.default.VersionManagerVersionMetadataIncorrectType);
            }
        }));
        it('should throw if the versions folder is missing.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const versionModels = [
                { startingBlockchainTime: 1000, version: 'invalid_version' }
            ];
            const versionMgr = new VersionManager_1.default(config, versionModels);
            const resolver = new Resolver_1.default(versionMgr, operationStore);
            yield expectAsync(versionMgr.initialize(blockChain, cas, downloadMgr, operationStore, resolver, mockTransactionStore, mockConfirmationStore)).toBeRejected();
        }));
    }));
    describe('loadDefaultExportsForVersion()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should be able to load a default export of a versioned component successfully.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const versionModels = [
                { startingBlockchainTime: 1, version: 'unused' }
            ];
            const versionManager = new VersionManager_1.default(config, versionModels);
            const OperationProcessor = yield versionManager.loadDefaultExportsForVersion('latest', 'OperationProcessor');
            const operationProcessor = new OperationProcessor();
            expect(operationProcessor).toBeDefined();
        }));
    }));
    describe('getTransactionSelector()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should return the correct version of `ITransactionSelector`.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const versionModels = [
                { startingBlockchainTime: 1000, version: '1000' },
                { startingBlockchainTime: 2000, version: '2000' }
            ];
            const versionManager = new VersionManager_1.default(config, versionModels);
            const mockTransactionSelector1 = class {
                selectQualifiedTransactions() { return []; }
            };
            const anyTransactionModel = OperationGenerator_1.default.generateTransactionModel();
            const mockTransactionSelector2 = class {
                selectQualifiedTransactions() { return [anyTransactionModel]; }
            };
            spyOn(versionManager, 'loadDefaultExportsForVersion').and.callFake((version, className) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                var _c;
                if (className === 'TransactionSelector') {
                    if (version === '1000') {
                        return mockTransactionSelector1;
                    }
                    else {
                        return mockTransactionSelector2;
                    }
                }
                const classObject = (yield (_c = `../../lib/core/versions/latest/${className}`, Promise.resolve().then(() => require(_c)))).default;
                if (className === 'MongoDbOperationQueue') {
                    classObject.prototype.initialize = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () { });
                }
                return classObject;
            }));
            const resolver = new Resolver_1.default(versionManager, operationStore);
            yield versionManager.initialize(blockChain, cas, downloadMgr, operationStore, resolver, mockTransactionStore, mockConfirmationStore);
            const transactions = yield versionManager.getTransactionSelector(2001).selectQualifiedTransactions([]);
            expect(transactions[0].anchorString).toEqual(anyTransactionModel.anchorString);
        }));
    }));
    describe('getVersionMetadata', () => {
        it('should return the expected versionMetadata', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const versionModels = [
                { startingBlockchainTime: 1000, version: 'test-version-1' }
            ];
            const versionMgr = new VersionManager_1.default(config, versionModels);
            spyOn(versionMgr, 'loadDefaultExportsForVersion').and.callFake((version, className) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                var _a;
                return (yield (_a = `./versions/${version}/${className}`, Promise.resolve().then(() => require(_a)))).default;
            }));
            const resolver = new Resolver_1.default(versionMgr, operationStore);
            yield versionMgr.initialize(blockChain, cas, downloadMgr, operationStore, resolver, mockTransactionStore, mockConfirmationStore);
            const result = versionMgr.getVersionMetadata(1001);
            expect(result.normalizedFeeToPerOperationFeeMultiplier).toEqual(0.01);
        }));
    });
    describe('get* functions.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should return the correct version-ed objects for valid version.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const versionModels = [
                { startingBlockchainTime: 1000, version: 'test-version-1' }
            ];
            const versionMgr = new VersionManager_1.default(config, versionModels);
            spyOn(versionMgr, 'loadDefaultExportsForVersion').and.callFake((version, className) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                var _d;
                return (yield (_d = `./versions/${version}/${className}`, Promise.resolve().then(() => require(_d)))).default;
            }));
            const resolver = new Resolver_1.default(versionMgr, operationStore);
            yield versionMgr.initialize(blockChain, cas, downloadMgr, operationStore, resolver, mockTransactionStore, mockConfirmationStore);
            const batchWriter = versionMgr.getBatchWriter(1000);
            yield expectAsync(batchWriter.write()).toBeRejected();
            const operationProcessor = versionMgr.getOperationProcessor(1001);
            const namedAnchoredOpModel = {
                type: OperationType_1.default.Create,
                didUniqueSuffix: 'unusedDidUniqueSuffix',
                transactionTime: 0,
                transactionNumber: 0,
                operationIndex: 0,
                operationBuffer: Buffer.from('')
            };
            yield expectAsync(operationProcessor.apply(namedAnchoredOpModel, undefined)).toBeRejected();
            const requestHandler = versionMgr.getRequestHandler(2000);
            yield expectAsync(requestHandler.handleResolveRequest('')).toBeRejected();
            const txProcessor = versionMgr.getTransactionProcessor(10000);
            const txModel = {
                anchorString: '',
                transactionNumber: 0,
                transactionTime: 0,
                transactionTimeHash: '',
                transactionFeePaid: 1,
                normalizedTransactionFee: 1,
                writer: 'writer'
            };
            yield expectAsync(txProcessor.processTransaction(txModel)).toBeRejected();
        }));
        it('should throw for an invalid version.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const versionModels = [
                { startingBlockchainTime: 1000, version: 'test-version-1' }
            ];
            const versionMgr = new VersionManager_1.default(config, versionModels);
            spyOn(versionMgr, 'loadDefaultExportsForVersion').and.callFake((version, className) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                var _e;
                return (yield (_e = `./versions/${version}/${className}`, Promise.resolve().then(() => require(_e)))).default;
            }));
            const resolver = new Resolver_1.default(versionMgr, operationStore);
            yield versionMgr.initialize(blockChain, cas, downloadMgr, operationStore, resolver, mockTransactionStore, mockConfirmationStore);
            expect(() => { versionMgr.getBatchWriter(0); }).toThrowError();
            expect(() => { versionMgr.getOperationProcessor(999); }).toThrowError();
            expect(() => { versionMgr.getRequestHandler(100); }).toThrowError();
            expect(() => { versionMgr.getTransactionProcessor(500); }).toThrowError();
        }));
    }));
}));
//# sourceMappingURL=VersionManager.spec.js.map