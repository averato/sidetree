"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const semver = require("semver");
const timeSpan = require("time-span");
const BitcoinBlockDataIterator_1 = require("./BitcoinBlockDataIterator");
const BitcoinClient_1 = require("./BitcoinClient");
const ErrorCode_1 = require("./ErrorCode");
const EventCode_1 = require("./EventCode");
const EventEmitter_1 = require("../common/EventEmitter");
const LockMonitor_1 = require("./lock/LockMonitor");
const LockResolver_1 = require("./lock/LockResolver");
const LogColor_1 = require("../common/LogColor");
const Logger_1 = require("../common/Logger");
const MongoDbBlockMetadataStore_1 = require("./MongoDbBlockMetadataStore");
const MongoDbLockTransactionStore_1 = require("./lock/MongoDbLockTransactionStore");
const MongoDbServiceStateStore_1 = require("../common/MongoDbServiceStateStore");
const MongoDbTransactionStore_1 = require("../common/MongoDbTransactionStore");
const Monitor_1 = require("./Monitor");
const RequestError_1 = require("./RequestError");
const ResponseStatus_1 = require("../common/enums/ResponseStatus");
const ServiceInfoProvider_1 = require("../common/ServiceInfoProvider");
const SharedErrorCode_1 = require("../common/SharedErrorCode");
const SidetreeError_1 = require("../common/SidetreeError");
const SidetreeTransactionParser_1 = require("./SidetreeTransactionParser");
const SpendingMonitor_1 = require("./SpendingMonitor");
const TransactionNumber_1 = require("./TransactionNumber");
const VersionManager_1 = require("./VersionManager");
class BitcoinProcessor {
    constructor(config) {
        this.config = config;
        this.versionManager = new VersionManager_1.default();
        this.genesisBlockNumber = config.genesisBlockNumber;
        this.serviceStateStore = new MongoDbServiceStateStore_1.default(config.mongoDbConnectionString, config.databaseName);
        this.blockMetadataStore = new MongoDbBlockMetadataStore_1.default(config.mongoDbConnectionString, config.databaseName);
        this.transactionStore = new MongoDbTransactionStore_1.default(config.mongoDbConnectionString, config.databaseName);
        this.spendingMonitor = new SpendingMonitor_1.default(config.bitcoinFeeSpendingCutoffPeriodInBlocks, BitcoinClient_1.default.convertBtcToSatoshis(config.bitcoinFeeSpendingCutoff), this.transactionStore);
        this.serviceInfoProvider = new ServiceInfoProvider_1.default('bitcoin');
        this.bitcoinClient =
            new BitcoinClient_1.default(config.bitcoinPeerUri, config.bitcoinRpcUsername, config.bitcoinRpcPassword, config.bitcoinWalletOrImportString, config.requestTimeoutInMilliseconds || 300, config.requestMaxRetries || 3, config.sidetreeTransactionFeeMarkupPercentage || 0, config.defaultTransactionFeeInSatoshisPerKB);
        this.sidetreeTransactionParser = new SidetreeTransactionParser_1.default(this.bitcoinClient, this.config.sidetreeTransactionPrefix);
        this.lockResolver =
            new LockResolver_1.default(this.versionManager, this.bitcoinClient);
        this.mongoDbLockTransactionStore = new MongoDbLockTransactionStore_1.default(config.mongoDbConnectionString, config.databaseName);
        const valueTimeLockTransactionFeesInBtc = config.valueTimeLockTransactionFeesAmountInBitcoins === undefined ? 0.25
            : config.valueTimeLockTransactionFeesAmountInBitcoins;
        this.lockMonitor = new LockMonitor_1.default(this.bitcoinClient, this.mongoDbLockTransactionStore, this.lockResolver, config.valueTimeLockPollPeriodInSeconds, config.valueTimeLockUpdateEnabled, BitcoinClient_1.default.convertBtcToSatoshis(config.valueTimeLockAmountInBitcoins), BitcoinClient_1.default.convertBtcToSatoshis(valueTimeLockTransactionFeesInBtc), this.versionManager);
        this.monitor = new Monitor_1.default(this.bitcoinClient);
    }
    initialize(versionModels, customLogger, customEventEmitter) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.initialize(customLogger);
            EventEmitter_1.default.initialize(customEventEmitter);
            yield this.bitcoinClient.initialize();
            yield this.versionManager.initialize(versionModels, this.config, this.blockMetadataStore);
            yield this.serviceStateStore.initialize();
            yield this.blockMetadataStore.initialize();
            yield this.transactionStore.initialize();
            yield this.mongoDbLockTransactionStore.initialize();
            yield this.upgradeDatabaseIfNeeded();
            if (this.config.transactionPollPeriodInSeconds > 0) {
                this.lastProcessedBlock = yield this.blockMetadataStore.getLast();
                const startingBlock = yield this.getStartingBlockForPeriodicPoll();
                if (startingBlock === undefined) {
                    Logger_1.default.info('Bitcoin processor state is ahead of Bitcoin Core, skipping initialization...');
                }
                else {
                    Logger_1.default.info('Synchronizing blocks for sidetree transactions...');
                    Logger_1.default.info(`Starting block: ${startingBlock.height} (${startingBlock.hash})`);
                    if (this.config.bitcoinDataDirectory) {
                        yield this.fastProcessTransactions(startingBlock);
                    }
                    else {
                        yield this.processTransactions(startingBlock);
                    }
                }
                this.periodicPoll();
            }
            else {
                Logger_1.default.warn(LogColor_1.default.yellow(`Transaction observer is disabled.`));
            }
            yield this.lockMonitor.startPeriodicProcessing();
        });
    }
    upgradeDatabaseIfNeeded() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
            yield this.blockMetadataStore.clearCollection();
            yield this.transactionStore.clearCollection();
            yield this.serviceStateStore.put({ databaseVersion: expectedDbVersion });
            Logger_1.default.warn(LogColor_1.default.yellow(`DB upgraded in: ${LogColor_1.default.green(timer.rounded())} ms.`));
        });
    }
    fastProcessTransactions(startingBlock) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bitcoinBlockDataIterator = new BitcoinBlockDataIterator_1.default(this.config.bitcoinDataDirectory);
            const lastBlockHeight = yield this.bitcoinClient.getCurrentBlockHeight();
            const lastBlockInfo = yield this.bitcoinClient.getBlockInfoFromHeight(lastBlockHeight);
            const notYetValidatedBlocks = new Map();
            const validatedBlocks = [];
            Logger_1.default.info(`Begin fast processing block ${startingBlock.height} to ${lastBlockHeight}`);
            let hashOfEarliestKnownValidBlock = lastBlockInfo.hash;
            let heightOfEarliestKnownValidBlock = lastBlockInfo.height;
            while (bitcoinBlockDataIterator.hasPrevious() && heightOfEarliestKnownValidBlock >= startingBlock.height) {
                const blocks = bitcoinBlockDataIterator.previous();
                yield this.processBlocks(blocks, notYetValidatedBlocks, startingBlock.height, heightOfEarliestKnownValidBlock);
                this.findEarliestValidBlockAndAddToValidBlocks(validatedBlocks, notYetValidatedBlocks, hashOfEarliestKnownValidBlock, startingBlock.height);
                if (validatedBlocks.length > 0) {
                    heightOfEarliestKnownValidBlock = validatedBlocks[validatedBlocks.length - 1].height - 1;
                    hashOfEarliestKnownValidBlock = validatedBlocks[validatedBlocks.length - 1].previousHash;
                }
            }
            yield this.removeTransactionsInInvalidBlocks(notYetValidatedBlocks);
            const timer = timeSpan();
            const validatedBlocksOrderedByHeight = validatedBlocks.reverse();
            yield this.writeBlocksToMetadataStoreWithFee(validatedBlocksOrderedByHeight);
            Logger_1.default.info(`Inserted metadata of ${validatedBlocks.length} blocks to DB. Duration: ${timer.rounded()} ms.`);
            Logger_1.default.info('finished fast processing');
        });
    }
    processBlocks(blocks, notYetValidatedBlocks, startingBlockHeight, heightOfEarliestKnownValidBlock) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const block of blocks) {
                if (block.height >= startingBlockHeight && block.height <= heightOfEarliestKnownValidBlock) {
                    const blockMetadataWithoutFee = {
                        height: block.height,
                        hash: block.hash,
                        totalFee: BitcoinProcessor.getBitcoinBlockTotalFee(block),
                        transactionCount: block.transactions.length,
                        previousHash: block.previousHash
                    };
                    notYetValidatedBlocks.set(block.hash, blockMetadataWithoutFee);
                    yield this.processSidetreeTransactionsInBlock(block);
                }
            }
        });
    }
    findEarliestValidBlockAndAddToValidBlocks(validatedBlocks, notYetValidatedBlocks, hashOfEarliestKnownValidBlock, startingBlockHeight) {
        let validBlockCount = 0;
        let validBlock = notYetValidatedBlocks.get(hashOfEarliestKnownValidBlock);
        while (validBlock !== undefined && validBlock.height >= startingBlockHeight) {
            validatedBlocks.push(validBlock);
            notYetValidatedBlocks.delete(hashOfEarliestKnownValidBlock);
            hashOfEarliestKnownValidBlock = validBlock.previousHash;
            validBlock = notYetValidatedBlocks.get(hashOfEarliestKnownValidBlock);
            validBlockCount++;
        }
        Logger_1.default.info(LogColor_1.default.lightBlue(`Found ${LogColor_1.default.green(validBlockCount)} valid blocks.`));
    }
    removeTransactionsInInvalidBlocks(invalidBlocks) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const hashes = invalidBlocks.keys();
            for (const hash of hashes) {
                yield this.transactionStore.removeTransactionByTransactionTimeHash(hash);
            }
        });
    }
    static getBitcoinBlockTotalFee(block) {
        const coinbaseTransaction = block.transactions[0];
        let totalOutputSatoshi = 0;
        for (const output of coinbaseTransaction.outputs) {
            totalOutputSatoshi += output.satoshis;
        }
        return totalOutputSatoshi - BitcoinProcessor.getBitcoinBlockReward(block.height);
    }
    static getBitcoinBlockReward(height) {
        const halvingTimes = Math.floor(height / 210000);
        if (halvingTimes >= 64) {
            return 0;
        }
        return Math.floor(5000000000 / (Math.pow(2, halvingTimes)));
    }
    processSidetreeTransactionsInBlock(block) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const transactions = block.transactions;
            for (let transactionIndex = 0; transactionIndex < transactions.length; transactionIndex++) {
                const transaction = transactions[transactionIndex];
                try {
                    const sidetreeTxToAdd = yield this.getSidetreeTransactionModelIfExist(transaction, transactionIndex, block.height);
                    if (sidetreeTxToAdd) {
                        Logger_1.default.info(LogColor_1.default.lightBlue(`Sidetree transaction found; adding ${LogColor_1.default.green(JSON.stringify(sidetreeTxToAdd))}`));
                        yield this.transactionStore.addTransaction(sidetreeTxToAdd);
                    }
                }
                catch (e) {
                    const inputs = { blockHeight: block.height, blockHash: block.hash, transactionIndex: transactionIndex };
                    Logger_1.default.info(`An error happened when trying to add sidetree transaction to the store. Inputs: ${JSON.stringify(inputs)}\r\n` +
                        `Full error: ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`);
                    throw e;
                }
            }
        });
    }
    time(hash) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Getting time ${hash ? 'of time hash ' + hash : ''}`);
            if (!hash) {
                const block = yield this.blockMetadataStore.getLast();
                return {
                    time: block.height,
                    hash: block.hash
                };
            }
            const blockInfo = yield this.bitcoinClient.getBlockInfo(hash);
            return {
                hash: hash,
                time: blockInfo.height
            };
        });
    }
    transactions(since, hash) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(LogColor_1.default.lightBlue(`Transactions request: since transaction number ${LogColor_1.default.green(since)}, time hash '${LogColor_1.default.green(hash)}'...`));
            if ((since && !hash) ||
                (!since && hash)) {
                throw new RequestError_1.default(ResponseStatus_1.default.BadRequest);
            }
            if (since && hash) {
                if (!(yield this.verifyBlock(TransactionNumber_1.default.getBlockNumber(since), hash))) {
                    Logger_1.default.info('Requested transactions hash mismatched blockchain');
                    throw new RequestError_1.default(ResponseStatus_1.default.BadRequest, SharedErrorCode_1.default.InvalidTransactionNumberOrTimeHash);
                }
            }
            Logger_1.default.info(`Returning transactions since ${since ? 'block ' + TransactionNumber_1.default.getBlockNumber(since) : 'beginning'}...`);
            const lastProcessedBlock = yield this.blockMetadataStore.getLast();
            if (lastProcessedBlock === undefined) {
                return {
                    moreTransactions: false,
                    transactions: []
                };
            }
            if (!(yield this.verifyBlock(lastProcessedBlock.height, lastProcessedBlock.hash))) {
                Logger_1.default.info('Bitcoin service in a forked state, not returning transactions until the DB is reverted to correct chain.');
                return {
                    moreTransactions: false,
                    transactions: []
                };
            }
            const [transactions, lastBlockSeen] = yield this.getTransactionsSince(since, lastProcessedBlock.height);
            if (transactions.length !== 0) {
                const inclusiveFirstBlockHeight = transactions[0].transactionTime;
                const exclusiveLastBlockHeight = transactions[transactions.length - 1].transactionTime + 1;
                const blockMetaData = yield this.blockMetadataStore.get(inclusiveFirstBlockHeight, exclusiveLastBlockHeight);
                const blockMetaDataMap = new Map();
                for (const block of blockMetaData) {
                    blockMetaDataMap.set(block.height, block);
                }
                for (const transaction of transactions) {
                    const block = blockMetaDataMap.get(transaction.transactionTime);
                    if (block !== undefined) {
                        transaction.normalizedTransactionFee = this.versionManager.getFeeCalculator(block.height).calculateNormalizedTransactionFeeFromBlock(block);
                    }
                    else {
                        throw new RequestError_1.default(ResponseStatus_1.default.ServerError, ErrorCode_1.default.BitcoinBlockMetadataNotFound);
                    }
                }
            }
            const moreTransactions = lastBlockSeen < lastProcessedBlock.height;
            return {
                transactions,
                moreTransactions
            };
        });
    }
    firstValidBlock(blocks) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (let index = 0; index < blocks.length; index++) {
                const block = blocks[index];
                if (yield this.verifyBlock(block.height, block.hash)) {
                    return block;
                }
            }
            return undefined;
        });
    }
    firstValidTransaction(transactions) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (let index = 0; index < transactions.length; index++) {
                const transaction = transactions[index];
                const height = transaction.transactionTime;
                const hash = transaction.transactionTimeHash;
                if (yield this.verifyBlock(height, hash)) {
                    return transaction;
                }
            }
            return undefined;
        });
    }
    writeTransaction(anchorString, minimumFee) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const sidetreeTransactionString = `${this.config.sidetreeTransactionPrefix}${anchorString}`;
            const sidetreeTransaction = yield this.bitcoinClient.createSidetreeTransaction(sidetreeTransactionString, minimumFee);
            const transactionFee = sidetreeTransaction.transactionFee;
            Logger_1.default.info(`Fee: ${transactionFee}. Anchoring string ${anchorString}`);
            const feeWithinSpendingLimits = yield this.spendingMonitor.isCurrentFeeWithinSpendingLimit(transactionFee, this.lastProcessedBlock.height);
            if (!feeWithinSpendingLimits) {
                throw new RequestError_1.default(ResponseStatus_1.default.BadRequest, SharedErrorCode_1.default.SpendingCapPerPeriodReached);
            }
            const totalSatoshis = yield this.bitcoinClient.getBalanceInSatoshis();
            if (totalSatoshis < transactionFee) {
                const error = new Error(`Not enough satoshis to broadcast. Failed to broadcast anchor string ${anchorString}`);
                Logger_1.default.error(error);
                throw new RequestError_1.default(ResponseStatus_1.default.BadRequest, SharedErrorCode_1.default.NotEnoughBalanceForWrite);
            }
            const transactionHash = yield this.bitcoinClient.broadcastSidetreeTransaction(sidetreeTransaction);
            Logger_1.default.info(LogColor_1.default.lightBlue(`Successfully submitted transaction [hash: ${LogColor_1.default.green(transactionHash)}]`));
            this.spendingMonitor.addTransactionDataBeingWritten(anchorString);
        });
    }
    writeBlocksToMetadataStoreWithFee(blocks) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const blocksToWrite = [];
            for (const block of blocks) {
                const feeCalculator = yield this.versionManager.getFeeCalculator(block.height);
                const blockMetadata = yield feeCalculator.addNormalizedFeeToBlockMetadata({
                    height: block.height,
                    hash: block.hash,
                    previousHash: block.previousHash,
                    transactionCount: block.transactionCount,
                    totalFee: block.totalFee
                });
                blocksToWrite.push(blockMetadata);
            }
            this.blockMetadataStore.add(blocksToWrite);
            this.lastProcessedBlock = blocksToWrite[blocksToWrite.length - 1];
        });
    }
    getNormalizedFee(block) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const blockNumber = Number(block);
            if (blockNumber < this.genesisBlockNumber) {
                const error = `The input block number must be greater than or equal to: ${this.genesisBlockNumber}`;
                Logger_1.default.error(error);
                throw new RequestError_1.default(ResponseStatus_1.default.BadRequest, SharedErrorCode_1.default.BlockchainTimeOutOfRange);
            }
            const normalizedTransactionFee = yield this.versionManager.getFeeCalculator(blockNumber).getNormalizedFee(blockNumber);
            return { normalizedTransactionFee: normalizedTransactionFee };
        });
    }
    getServiceVersion() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.serviceInfoProvider.getServiceVersion();
        });
    }
    getValueTimeLock(lockIdentifier) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.lockResolver.resolveSerializedLockIdentifierAndThrowOnError(lockIdentifier);
            }
            catch (e) {
                Logger_1.default.info(`Value time lock not found. Identifier: ${lockIdentifier}. Error: ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`);
                throw new RequestError_1.default(ResponseStatus_1.default.NotFound, SharedErrorCode_1.default.ValueTimeLockNotFound);
            }
        });
    }
    getActiveValueTimeLockForThisNode() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let currentLock;
            try {
                currentLock = yield this.lockMonitor.getCurrentValueTimeLock();
            }
            catch (e) {
                if (e instanceof SidetreeError_1.default && e.code === ErrorCode_1.default.LockMonitorCurrentValueTimeLockInPendingState) {
                    throw new RequestError_1.default(ResponseStatus_1.default.NotFound, ErrorCode_1.default.ValueTimeLockInPendingState);
                }
                Logger_1.default.error(`Current value time lock retrieval failed with error: ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`);
                throw new RequestError_1.default(ResponseStatus_1.default.ServerError);
            }
            if (!currentLock) {
                throw new RequestError_1.default(ResponseStatus_1.default.NotFound, SharedErrorCode_1.default.ValueTimeLockNotFound);
            }
            return currentLock;
        });
    }
    static generatePrivateKeyForTestnet() {
        return BitcoinClient_1.default.generatePrivateKey('testnet');
    }
    periodicPoll(interval = this.config.transactionPollPeriodInSeconds) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                if (this.pollTimeoutId) {
                    clearTimeout(this.pollTimeoutId);
                }
                const startingBlock = yield this.getStartingBlockForPeriodicPoll();
                if (startingBlock === undefined) {
                    Logger_1.default.info('Bitcoin processor state is ahead of bitcoind: skipping periodic poll');
                }
                else {
                    yield this.processTransactions(startingBlock);
                }
                EventEmitter_1.default.emit(EventCode_1.default.BitcoinObservingLoopSuccess);
            }
            catch (error) {
                EventEmitter_1.default.emit(EventCode_1.default.BitcoinObservingLoopFailure);
                Logger_1.default.error(error);
            }
            finally {
                let timer = setTimeout(this.periodicPoll.bind(this), 1000 * interval, interval);
                this.pollTimeoutId = timer;
            }
        });
    }
    processTransactions(startBlock) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Starting processTransaction at: ${Date.now()}`);
            const startBlockHeight = startBlock.height;
            if (startBlockHeight < this.genesisBlockNumber) {
                throw new SidetreeError_1.default(ErrorCode_1.default.BitcoinProcessorCannotProcessBlocksBeforeGenesis, `Input block: ${startBlock}. Genesis block: ${this.genesisBlockNumber}`);
            }
            const endBlockHeight = yield this.bitcoinClient.getCurrentBlockHeight();
            Logger_1.default.info(`Processing transactions from ${startBlockHeight} to ${endBlockHeight}`);
            let blockHeight = startBlockHeight;
            let previousBlockHash = startBlock.previousHash;
            while (blockHeight <= endBlockHeight) {
                const processedBlockMetadata = yield this.processBlock(blockHeight, previousBlockHash);
                this.lastProcessedBlock = processedBlockMetadata;
                blockHeight++;
                previousBlockHash = processedBlockMetadata.hash;
            }
            Logger_1.default.info(`Finished processing blocks ${startBlockHeight} to ${endBlockHeight}`);
        });
    }
    getStartingBlockForPeriodicPoll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.lastProcessedBlock === undefined) {
                yield this.trimDatabasesToBlock();
                return this.bitcoinClient.getBlockInfoFromHeight(this.genesisBlockNumber);
            }
            const lastProcessedBlockIsValid = yield this.verifyBlock(this.lastProcessedBlock.height, this.lastProcessedBlock.hash);
            let lastValidBlock;
            if (lastProcessedBlockIsValid) {
                lastValidBlock = this.lastProcessedBlock;
                yield this.trimDatabasesToBlock(lastValidBlock.height);
            }
            else {
                lastValidBlock = yield this.revertDatabases();
            }
            const startingBlockHeight = lastValidBlock ? lastValidBlock.height + 1 : this.genesisBlockNumber;
            const currentHeight = yield this.bitcoinClient.getCurrentBlockHeight();
            if (startingBlockHeight > currentHeight) {
                return undefined;
            }
            return this.bitcoinClient.getBlockInfoFromHeight(startingBlockHeight);
        });
    }
    revertDatabases() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Reverting databases...`);
            const exponentiallySpacedBlocks = yield this.blockMetadataStore.lookBackExponentially();
            const lastKnownValidBlock = yield this.firstValidBlock(exponentiallySpacedBlocks);
            const lastKnownValidBlockHeight = lastKnownValidBlock ? lastKnownValidBlock.height : undefined;
            Logger_1.default.info(LogColor_1.default.lightBlue(`Reverting database to ${LogColor_1.default.green(lastKnownValidBlockHeight || 'genesis')} block...`));
            yield this.trimDatabasesToBlock(lastKnownValidBlockHeight);
            EventEmitter_1.default.emit(EventCode_1.default.BitcoinDatabasesRevert, { blockHeight: lastKnownValidBlockHeight });
            return lastKnownValidBlock;
        });
    }
    trimDatabasesToBlock(blockHeight) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Trimming all block and transaction data after block height: ${blockHeight}`);
            yield this.blockMetadataStore.removeLaterThan(blockHeight);
            const lastTransactionNumberOfGivenBlock = blockHeight ? TransactionNumber_1.default.lastTransactionOfBlock(blockHeight) : undefined;
            yield this.transactionStore.removeTransactionsLaterThan(lastTransactionNumberOfGivenBlock);
        });
    }
    verifyBlock(height, hash) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Verifying block ${height} (${hash})`);
            const currentBlockHeight = yield this.bitcoinClient.getCurrentBlockHeight();
            if (currentBlockHeight < height) {
                return false;
            }
            const responseData = yield this.bitcoinClient.getBlockHash(height);
            Logger_1.default.info(`Retrieved block ${height} (${responseData})`);
            return hash === responseData;
        });
    }
    processBlock(blockHeight, previousBlockHash) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Processing block ${blockHeight}`);
            const blockHash = yield this.bitcoinClient.getBlockHash(blockHeight);
            const blockData = yield this.bitcoinClient.getBlock(blockHash);
            if (blockData.previousHash !== previousBlockHash) {
                throw new SidetreeError_1.default(ErrorCode_1.default.BitcoinProcessInvalidPreviousBlockHash, `Previous hash from blockchain: ${blockData.previousHash}. Expected value: ${previousBlockHash}`);
            }
            yield this.processSidetreeTransactionsInBlock(blockData);
            const transactionCount = blockData.transactions.length;
            const totalFee = BitcoinProcessor.getBitcoinBlockTotalFee(blockData);
            const feeCalculator = this.versionManager.getFeeCalculator(blockHeight);
            const processedBlockMetadata = yield feeCalculator.addNormalizedFeeToBlockMetadata({
                hash: blockHash,
                height: blockHeight,
                previousHash: blockData.previousHash,
                totalFee,
                transactionCount
            });
            yield this.blockMetadataStore.add([processedBlockMetadata]);
            return processedBlockMetadata;
        });
    }
    getSidetreeTransactionModelIfExist(transaction, transactionIndex, transactionBlock) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const sidetreeData = yield this.sidetreeTransactionParser.parse(transaction);
            if (sidetreeData) {
                const transactionFeePaid = yield this.bitcoinClient.getTransactionFeeInSatoshis(transaction.id);
                return {
                    transactionNumber: TransactionNumber_1.default.construct(transactionBlock, transactionIndex),
                    transactionTime: transactionBlock,
                    transactionTimeHash: transaction.blockHash,
                    anchorString: sidetreeData.data,
                    transactionFeePaid: transactionFeePaid,
                    writer: sidetreeData.writer
                };
            }
            return undefined;
        });
    }
    getTransactionsSince(since, maxBlockHeight) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let inclusiveBeginTransactionTime = since === undefined ? this.genesisBlockNumber : TransactionNumber_1.default.getBlockNumber(since);
            const transactionsToReturn = [];
            while (transactionsToReturn.length === 0 && inclusiveBeginTransactionTime <= maxBlockHeight) {
                const exclusiveEndTransactionTime = inclusiveBeginTransactionTime + BitcoinProcessor.pageSizeInBlocks;
                let transactions = yield this.transactionStore.getTransactionsStartingFrom(inclusiveBeginTransactionTime, exclusiveEndTransactionTime);
                transactions = transactions.filter((transaction) => {
                    return transaction.transactionTime <= maxBlockHeight &&
                        (since === undefined || transaction.transactionNumber > since);
                });
                inclusiveBeginTransactionTime = exclusiveEndTransactionTime;
                transactionsToReturn.push(...transactions);
            }
            return [transactionsToReturn, inclusiveBeginTransactionTime - 1];
        });
    }
}
exports.default = BitcoinProcessor;
BitcoinProcessor.pageSizeInBlocks = 100;
//# sourceMappingURL=BitcoinProcessor.js.map