"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const httpStatus = require("http-status");
const bitcore_lib_1 = require("bitcore-lib");
const node_fetch_1 = require("node-fetch");
const BitcoinWallet_1 = require("./BitcoinWallet");
const ErrorCode_1 = require("./ErrorCode");
const LogColor_1 = require("../common/LogColor");
const Logger_1 = require("../common/Logger");
const ReadableStream_1 = require("../common/ReadableStream");
const SidetreeError_1 = require("../common/SidetreeError");
class BitcoinClient {
    constructor(bitcoinPeerUri, bitcoinRpcUsername, bitcoinRpcPassword, bitcoinWalletOrImportString, requestTimeout, requestMaxRetries, sidetreeTransactionFeeMarkupPercentage, estimatedFeeSatoshiPerKB) {
        this.bitcoinPeerUri = bitcoinPeerUri;
        this.requestTimeout = requestTimeout;
        this.requestMaxRetries = requestMaxRetries;
        this.sidetreeTransactionFeeMarkupPercentage = sidetreeTransactionFeeMarkupPercentage;
        this.estimatedFeeSatoshiPerKB = estimatedFeeSatoshiPerKB;
        this.walletNameToUse = 'sidetreeDefaultWallet';
        if (typeof bitcoinWalletOrImportString === 'string') {
            Logger_1.default.info('Creating bitcoin wallet using the import string passed in.');
            this.bitcoinWallet = new BitcoinWallet_1.default(bitcoinWalletOrImportString);
        }
        else {
            Logger_1.default.info(`Using the bitcoin wallet passed in.`);
            this.bitcoinWallet = bitcoinWalletOrImportString;
        }
        if (bitcoinRpcUsername && bitcoinRpcPassword) {
            this.bitcoinAuthorization = Buffer.from(`${bitcoinRpcUsername}:${bitcoinRpcPassword}`).toString('base64');
        }
    }
    initialize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bitcoinCoreStatusPollingWindowInSeconds = 60;
            yield this.waitUntilBitcoinCoreIsReady(bitcoinCoreStatusPollingWindowInSeconds);
            yield this.initializeBitcoinCore();
        });
    }
    waitUntilBitcoinCoreIsReady(pollingWindowInSeconds) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            while (true) {
                try {
                    Logger_1.default.info('Getting blockchain info...');
                    const request = {
                        method: 'getblockchaininfo'
                    };
                    const isWalletRpc = false;
                    const allowTimeout = true;
                    const response = yield this.rpcCall(request, allowTimeout, isWalletRpc);
                    const blockHeight = response.headers;
                    const syncedBlockHeight = response.blocks;
                    Logger_1.default.info(LogColor_1.default.lightBlue(`Bitcoin sync progress: block height ${LogColor_1.default.green(blockHeight)}, sync-ed: ${LogColor_1.default.green(syncedBlockHeight)}`));
                    if (blockHeight !== 0 && syncedBlockHeight === blockHeight) {
                        Logger_1.default.info(LogColor_1.default.lightBlue('Bitcoin Core fully synchronized'));
                        return;
                    }
                }
                catch (error) {
                    Logger_1.default.info(LogColor_1.default.yellow(`Bitcoin Core not ready or not available: ${error}.`));
                }
                Logger_1.default.info(`Recheck after ${pollingWindowInSeconds} seconds...`);
                yield new Promise(resolve => setTimeout(resolve, pollingWindowInSeconds * 1000));
            }
        });
    }
    initializeBitcoinCore() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.createWallet();
            yield this.loadWallet();
            const walletAddress = this.bitcoinWallet.getAddress();
            if (!(yield this.isAddressAddedToWallet(walletAddress.toString()))) {
                Logger_1.default.info(`Configuring Bitcoin Core to watch address ${walletAddress}. Requires parsing transactions starting from genesis, will take a while...`);
                const publicKeyAsHex = this.bitcoinWallet.getPublicKeyAsHex();
                yield this.addWatchOnlyAddressToWallet(publicKeyAsHex, true);
            }
            else {
                Logger_1.default.info(`Bitcoin Core wallet is already watching address: ${walletAddress}`);
            }
        });
    }
    static generatePrivateKey(network) {
        let bitcoreNetwork;
        switch (network) {
            case 'mainnet':
                bitcoreNetwork = bitcore_lib_1.Networks.mainnet;
                break;
            case 'livenet':
                bitcoreNetwork = bitcore_lib_1.Networks.livenet;
                break;
            case 'testnet':
                bitcoreNetwork = bitcore_lib_1.Networks.testnet;
                break;
        }
        return new bitcore_lib_1.PrivateKey(undefined, bitcoreNetwork).toWIF();
    }
    static convertBtcToSatoshis(amountInBtc) {
        return bitcore_lib_1.Unit.fromBTC(amountInBtc).toSatoshis();
    }
    broadcastSidetreeTransaction(bitcoinSidetreeTransaction) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.broadcastTransactionRpc(bitcoinSidetreeTransaction.serializedTransactionObject);
        });
    }
    broadcastLockTransaction(bitcoinLockTransaction) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const transactionHash = yield this.broadcastTransactionRpc(bitcoinLockTransaction.serializedTransactionObject);
            Logger_1.default.info(`Broadcasted lock transaction: ${transactionHash}`);
            return transactionHash;
        });
    }
    createSidetreeTransaction(transactionData, minimumFeeInSatoshis) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const transaction = yield this.createTransaction(transactionData, minimumFeeInSatoshis);
            const signedTransaction = yield this.bitcoinWallet.signTransaction(transaction);
            const serializedTransaction = BitcoinClient.serializeSignedTransaction(signedTransaction);
            return {
                transactionId: signedTransaction.id,
                transactionFee: transaction.getFee(),
                serializedTransactionObject: serializedTransaction
            };
        });
    }
    createLockTransaction(lockAmountInSatoshis, lockDurationInBlocks) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const unspentCoins = yield this.getUnspentOutputs(this.bitcoinWallet.getAddress());
            const [freezeTransaction, redeemScript] = yield this.createFreezeTransaction(unspentCoins, lockDurationInBlocks, lockAmountInSatoshis);
            const signedTransaction = yield this.bitcoinWallet.signFreezeTransaction(freezeTransaction, redeemScript);
            const serializedTransaction = BitcoinClient.serializeSignedTransaction(signedTransaction);
            return {
                transactionId: signedTransaction.id,
                transactionFee: freezeTransaction.getFee(),
                redeemScriptAsHex: redeemScript.toHex(),
                serializedTransactionObject: serializedTransaction
            };
        });
    }
    createRelockTransaction(existingLockTransactionId, existingLockDurationInBlocks, newLockDurationInBlocks) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const existingLockTransaction = yield this.getRawTransactionRpc(existingLockTransactionId);
            const [freezeTransaction, redeemScript] = yield this.createSpendToFreezeTransaction(existingLockTransaction, existingLockDurationInBlocks, newLockDurationInBlocks);
            const previousFreezeScript = BitcoinClient.createFreezeScript(existingLockDurationInBlocks, this.bitcoinWallet.getAddress());
            const signedTransaction = yield this.bitcoinWallet.signSpendFromFreezeTransaction(freezeTransaction, previousFreezeScript, redeemScript);
            const serializedTransaction = BitcoinClient.serializeSignedTransaction(signedTransaction);
            return {
                transactionId: signedTransaction.id,
                transactionFee: freezeTransaction.getFee(),
                redeemScriptAsHex: redeemScript.toHex(),
                serializedTransactionObject: serializedTransaction
            };
        });
    }
    createReleaseLockTransaction(existingLockTransactionId, existingLockDurationInBlocks) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const existingLockTransaction = yield this.getRawTransactionRpc(existingLockTransactionId);
            const releaseLockTransaction = yield this.createSpendToWalletTransaction(existingLockTransaction, existingLockDurationInBlocks);
            const previousFreezeScript = BitcoinClient.createFreezeScript(existingLockDurationInBlocks, this.bitcoinWallet.getAddress());
            const signedTransaction = yield this.bitcoinWallet.signSpendFromFreezeTransaction(releaseLockTransaction, previousFreezeScript, undefined);
            const serializedTransaction = BitcoinClient.serializeSignedTransaction(signedTransaction);
            return {
                transactionId: signedTransaction.id,
                transactionFee: releaseLockTransaction.getFee(),
                redeemScriptAsHex: '',
                serializedTransactionObject: serializedTransaction
            };
        });
    }
    createWallet() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = {
                method: 'createwallet',
                params: [this.walletNameToUse]
            };
            const isWalletRpc = false;
            try {
                yield this.rpcCall(request, true, isWalletRpc);
                Logger_1.default.info(`Wallet created with name "${this.walletNameToUse}".`);
            }
            catch (e) {
                const duplicateCreateString = 'already exists';
                if (e instanceof SidetreeError_1.default && e.toString().toLowerCase().includes(duplicateCreateString)) {
                    Logger_1.default.info(`Wallet with name ${this.walletNameToUse} already exists.`);
                }
                else {
                    throw e;
                }
            }
        });
    }
    loadWallet() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = {
                method: 'loadwallet',
                params: [this.walletNameToUse, true]
            };
            const isWalletRpc = false;
            try {
                yield this.rpcCall(request, true, isWalletRpc);
                Logger_1.default.info(`Wallet loaded with name "${this.walletNameToUse}".`);
            }
            catch (e) {
                const duplicateLoadString = 'already loaded';
                if (e instanceof SidetreeError_1.default && e.toString().toLowerCase().includes(duplicateLoadString)) {
                    Logger_1.default.info(`Wallet with name ${this.walletNameToUse} already loaded.`);
                }
                else {
                    throw e;
                }
            }
        });
    }
    getBlock(hash) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = {
                method: 'getblock',
                params: [
                    hash,
                    2
                ]
            };
            const isWalletRpc = false;
            const block = yield this.rpcCall(request, true, isWalletRpc);
            const transactionModels = block.tx.map((txn) => {
                const transactionBuffer = Buffer.from(txn.hex, 'hex');
                const bitcoreTransaction = BitcoinClient.createBitcoreTransactionWrapper(transactionBuffer, block.confirmations, hash);
                return BitcoinClient.createBitcoinTransactionModel(bitcoreTransaction);
            });
            return {
                hash: block.hash,
                height: block.height,
                previousHash: block.previousblockhash,
                transactions: transactionModels
            };
        });
    }
    getBlockHash(height) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Getting hash for block ${height}`);
            const hashRequest = {
                method: 'getblockhash',
                params: [
                    height
                ]
            };
            const isWalletRpc = false;
            return this.rpcCall(hashRequest, true, isWalletRpc);
        });
    }
    getBlockInfoFromHeight(height) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.getBlockInfo(yield this.getBlockHash(height));
        });
    }
    getBlockInfo(hash) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = {
                method: 'getblockheader',
                params: [
                    hash,
                    true
                ]
            };
            const isWalletRpc = false;
            const response = yield this.rpcCall(request, true, isWalletRpc);
            return {
                hash: hash,
                height: response.height,
                previousHash: response.previousblockhash
            };
        });
    }
    getCurrentBlockHeight() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info('Getting current block height...');
            const request = {
                method: 'getblockcount'
            };
            const isWalletRpc = false;
            const response = yield this.rpcCall(request, true, isWalletRpc);
            return response;
        });
    }
    getBalanceInSatoshis() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const unspentOutputs = yield this.getUnspentOutputs(this.bitcoinWallet.getAddress());
            const unspentSatoshis = unspentOutputs.reduce((total, unspentOutput) => {
                return total + unspentOutput.satoshis;
            }, 0);
            return unspentSatoshis;
        });
    }
    getTransactionFeeInSatoshis(transactionId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const transaction = yield this.getRawTransaction(transactionId);
            let inputSatoshiSum = 0;
            for (let i = 0; i < transaction.inputs.length; i++) {
                const currentInput = transaction.inputs[i];
                const transactionOutValue = yield this.getTransactionOutValueInSatoshi(currentInput.previousTransactionId, currentInput.outputIndexInPreviousTransaction);
                inputSatoshiSum += transactionOutValue;
            }
            const transactionOutputs = transaction.outputs.map((output) => output.satoshis);
            const outputSatoshiSum = transactionOutputs.reduce((sum, value) => sum + value, 0);
            return (inputSatoshiSum - outputSatoshiSum);
        });
    }
    addWatchOnlyAddressToWallet(publicKeyAsHex, rescan) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = {
                method: 'importpubkey',
                params: [
                    publicKeyAsHex,
                    'sidetree',
                    rescan
                ]
            };
            const isWalletRpc = true;
            yield this.rpcCall(request, false, isWalletRpc);
        });
    }
    broadcastTransactionRpc(rawTransaction) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = {
                method: 'sendrawtransaction',
                params: [
                    rawTransaction
                ]
            };
            const isWalletRpc = false;
            return this.rpcCall(request, true, isWalletRpc);
        });
    }
    isAddressAddedToWallet(address) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Checking if bitcoin wallet for ${address} exists`);
            const request = {
                method: 'getaddressinfo',
                params: [
                    address
                ]
            };
            const isWalletRpc = true;
            const response = yield this.rpcCall(request, true, isWalletRpc);
            return response.labels.length > 0 || response.iswatchonly;
        });
    }
    getCurrentEstimatedFeeInSatoshisPerKB() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = {
                method: 'estimatesmartfee',
                params: [
                    1
                ]
            };
            const isWalletRpc = false;
            const response = yield this.rpcCall(request, true, isWalletRpc);
            if (!response.feerate ||
                (response.errors && response.errors.length > 0)) {
                const error = response.errors ? JSON.stringify(response.errors) : `Feerate is undefined`;
                throw new Error(`Fee rate could not be estimated. Error: ${error}`);
            }
            const feerateInBtc = response.feerate;
            return BitcoinClient.convertBtcToSatoshis(feerateInBtc);
        });
    }
    updateEstimatedFeeInSatoshisPerKB() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let estimatedFeeSatoshiPerKB;
            try {
                estimatedFeeSatoshiPerKB = yield this.getCurrentEstimatedFeeInSatoshisPerKB();
                this.estimatedFeeSatoshiPerKB = estimatedFeeSatoshiPerKB;
            }
            catch (error) {
                estimatedFeeSatoshiPerKB = this.estimatedFeeSatoshiPerKB;
                if (!estimatedFeeSatoshiPerKB) {
                    throw error;
                }
            }
            return estimatedFeeSatoshiPerKB;
        });
    }
    getTransactionOutValueInSatoshi(transactionId, outputIndex) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const transaction = yield this.getRawTransaction(transactionId);
            const vout = transaction.outputs[outputIndex];
            return vout.satoshis;
        });
    }
    getRawTransaction(transactionId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bitcoreTransaction = yield this.getRawTransactionRpc(transactionId);
            return BitcoinClient.createBitcoinTransactionModel(bitcoreTransaction);
        });
    }
    static convertToBitcoinTransactionModels(block) {
        const transactionModels = block.transactions.map((transaction) => {
            const bitcoreTransaction = {
                id: transaction.id,
                blockHash: block.hash,
                confirmations: 1,
                inputs: transaction.inputs,
                outputs: transaction.outputs
            };
            return BitcoinClient.createBitcoinTransactionModel(bitcoreTransaction);
        });
        return transactionModels;
    }
    getRawTransactionRpc(transactionId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const request = {
                method: 'getrawtransaction',
                params: [
                    transactionId,
                    true
                ]
            };
            const isWalletRpc = false;
            const rawTransactionData = yield this.rpcCall(request, true, isWalletRpc);
            const hexEncodedTransaction = rawTransactionData.hex;
            const transactionBuffer = Buffer.from(hexEncodedTransaction, 'hex');
            const confirmations = rawTransactionData.confirmations ? rawTransactionData.confirmations : 0;
            return BitcoinClient.createBitcoreTransactionWrapper(transactionBuffer, confirmations, rawTransactionData.blockhash);
        });
    }
    static createTransactionFromBuffer(buffer) {
        return new bitcore_lib_1.Transaction(buffer);
    }
    static createBitcoreTransactionWrapper(buffer, confirmations, blockHash) {
        const transaction = BitcoinClient.createTransactionFromBuffer(buffer);
        return {
            id: transaction.id,
            blockHash: blockHash,
            confirmations: confirmations,
            inputs: transaction.inputs,
            outputs: transaction.outputs
        };
    }
    createTransaction(transactionData, minFeeInSatoshis) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const walletAddress = this.bitcoinWallet.getAddress();
            const unspentOutputs = yield this.getUnspentOutputs(walletAddress);
            const transaction = new bitcore_lib_1.Transaction();
            transaction.from(unspentOutputs);
            transaction.addOutput(new bitcore_lib_1.Transaction.Output({
                script: bitcore_lib_1.Script.buildDataOut(transactionData),
                satoshis: 0
            }));
            transaction.change(walletAddress);
            const estimatedFeeInSatoshis = yield this.calculateTransactionFee(transaction);
            let feeToPay = Math.max(minFeeInSatoshis, estimatedFeeInSatoshis);
            feeToPay += (feeToPay * this.sidetreeTransactionFeeMarkupPercentage / 100);
            feeToPay = Math.ceil(feeToPay);
            transaction.fee(feeToPay);
            return transaction;
        });
    }
    calculateTransactionFee(transaction) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const estimatedFeePerKB = yield this.updateEstimatedFeeInSatoshisPerKB();
            const estimatedSizeInBytes = (transaction.inputs.length * 150) + (transaction.outputs.length * 50);
            const estimatedSizeInKB = estimatedSizeInBytes / 1000;
            const estimatedFee = estimatedSizeInKB * estimatedFeePerKB;
            const estimatedFeeWithPercentage = estimatedFee * 1.4;
            return Math.ceil(estimatedFeeWithPercentage);
        });
    }
    createFreezeTransaction(unspentCoins, freezeDurationInBlocks, freezeAmountInSatoshis) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Creating a freeze transaction for amount: ${freezeAmountInSatoshis} satoshis with freeze time in blocks: ${freezeDurationInBlocks}`);
            const walletAddress = this.bitcoinWallet.getAddress();
            const freezeScript = BitcoinClient.createFreezeScript(freezeDurationInBlocks, walletAddress);
            const payToScriptHashOutput = bitcore_lib_1.Script.buildScriptHashOut(freezeScript);
            const payToScriptAddress = new bitcore_lib_1.Address(payToScriptHashOutput);
            const freezeTransaction = new bitcore_lib_1.Transaction()
                .from(unspentCoins)
                .to(payToScriptAddress, freezeAmountInSatoshis)
                .change(walletAddress);
            const transactionFee = yield this.calculateTransactionFee(freezeTransaction);
            freezeTransaction.fee(transactionFee);
            const payToScriptAddressString = payToScriptAddress.toString();
            Logger_1.default.info(`Created freeze transaction and locked BTC at new script address '${payToScriptAddressString}' with fee of ${transactionFee}.`);
            return [freezeTransaction, freezeScript];
        });
    }
    createSpendToFreezeTransaction(previousFreezeTransaction, previousFreezeDurationInBlocks, newFreezeDurationInBlocks) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Creating a freeze transaction with freeze time of ${newFreezeDurationInBlocks} blocks, from previously frozen transaction with id: ${previousFreezeTransaction.id}`);
            const freezeScript = BitcoinClient.createFreezeScript(newFreezeDurationInBlocks, this.bitcoinWallet.getAddress());
            const payToScriptHashOutput = bitcore_lib_1.Script.buildScriptHashOut(freezeScript);
            const payToScriptAddress = new bitcore_lib_1.Address(payToScriptHashOutput);
            const reFreezeTransaction = yield this.createSpendTransactionFromFrozenTransaction(previousFreezeTransaction, previousFreezeDurationInBlocks, payToScriptAddress);
            const payToScriptAddressString = payToScriptAddress.toString();
            Logger_1.default.info(`Created refreeze transaction and locked BTC at new script address '${payToScriptAddressString}'.`);
            return [reFreezeTransaction, freezeScript];
        });
    }
    createSpendToWalletTransaction(previousFreezeTransaction, previousFreezeDurationInBlocks) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Creating a transaction to return (to the wallet) the previously frozen amount from transaction with id: ${previousFreezeTransaction.id} which was frozen for block duration: ${previousFreezeDurationInBlocks}`);
            return this.createSpendTransactionFromFrozenTransaction(previousFreezeTransaction, previousFreezeDurationInBlocks, this.bitcoinWallet.getAddress());
        });
    }
    createSpendTransactionFromFrozenTransaction(previousFreezeTransaction, previousFreezeDurationInBlocks, paytoAddress) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const frozenOutputAsInput = this.createUnspentOutputFromFrozenTransaction(previousFreezeTransaction, previousFreezeDurationInBlocks);
            const previousFreezeAmountInSatoshis = frozenOutputAsInput.satoshis;
            const spendTransaction = new bitcore_lib_1.Transaction()
                .from([frozenOutputAsInput])
                .to(paytoAddress, previousFreezeAmountInSatoshis);
            spendTransaction.version = 2;
            spendTransaction.inputs[0].sequenceNumber = previousFreezeDurationInBlocks;
            const transactionFee = yield this.calculateTransactionFee(spendTransaction);
            spendTransaction.outputs.shift();
            spendTransaction.to(paytoAddress, previousFreezeAmountInSatoshis - transactionFee)
                .fee(transactionFee);
            return spendTransaction;
        });
    }
    createUnspentOutputFromFrozenTransaction(previousFreezeTransaction, previousfreezeDurationInBlocks) {
        const previousFreezeAmountInSatoshis = previousFreezeTransaction.outputs[0].satoshis;
        const previousFreezeRedeemScript = BitcoinClient.createFreezeScript(previousfreezeDurationInBlocks, this.bitcoinWallet.getAddress());
        const scriptPubKey = bitcore_lib_1.Script.buildScriptHashOut(previousFreezeRedeemScript);
        const frozenOutputAsUnspentOutput = bitcore_lib_1.Transaction.UnspentOutput.fromObject({
            txid: previousFreezeTransaction.id,
            vout: 0,
            scriptPubKey: scriptPubKey,
            satoshis: previousFreezeAmountInSatoshis
        });
        return frozenOutputAsUnspentOutput;
    }
    static createFreezeScript(freezeDurationInBlocks, walletAddress) {
        const lockBuffer = bitcore_lib_1.crypto.BN.fromNumber(freezeDurationInBlocks).toScriptNumBuffer();
        const publicKeyHashOut = bitcore_lib_1.Script.buildPublicKeyHashOut(walletAddress);
        const redeemScript = bitcore_lib_1.Script.empty()
            .add(lockBuffer)
            .add(178)
            .add(117)
            .add(publicKeyHashOut);
        return redeemScript;
    }
    static serializeSignedTransaction(signedTransaction) {
        return signedTransaction.serialize({ disableAll: true });
    }
    static createBitcoinInputModel(bitcoreInput) {
        return {
            previousTransactionId: bitcoreInput.prevTxId.toString('hex'),
            outputIndexInPreviousTransaction: bitcoreInput.outputIndex,
            scriptAsmAsString: bitcoreInput.script ? bitcoreInput.script.toASM() : ''
        };
    }
    static createBitcoinOutputModel(bitcoreOutput) {
        return {
            satoshis: bitcoreOutput.satoshis,
            scriptAsmAsString: bitcoreOutput.script ? bitcoreOutput.script.toASM() : ''
        };
    }
    static createBitcoinTransactionModel(transactionWrapper) {
        const bitcoinInputs = transactionWrapper.inputs.map((input) => { return BitcoinClient.createBitcoinInputModel(input); });
        const bitcoinOutputs = transactionWrapper.outputs.map((output) => { return BitcoinClient.createBitcoinOutputModel(output); });
        return {
            inputs: bitcoinInputs,
            outputs: bitcoinOutputs,
            id: transactionWrapper.id,
            blockHash: transactionWrapper.blockHash,
            confirmations: transactionWrapper.confirmations
        };
    }
    getUnspentOutputs(address) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const addressToSearch = address.toString();
            Logger_1.default.info(`Getting unspent coins for ${addressToSearch}`);
            const request = {
                method: 'listunspent',
                params: [
                    0,
                    null,
                    [addressToSearch]
                ]
            };
            const isWalletRpc = true;
            const response = yield this.rpcCall(request, true, isWalletRpc);
            const unspentTransactions = response.map((coin) => {
                return new bitcore_lib_1.Transaction.UnspentOutput(coin);
            });
            Logger_1.default.info(`Returning ${unspentTransactions.length} coins`);
            return unspentTransactions;
        });
    }
    rpcCall(request, timeout, isWalletRpc) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            request.jsonrpc = '1.0';
            request.id = Math.round(Math.random() * Number.MAX_SAFE_INTEGER).toString(32);
            const requestString = JSON.stringify(request);
            Logger_1.default.info(`Sending RPC request: ${requestString}`);
            const requestOptions = {
                body: requestString,
                method: 'post'
            };
            if (this.bitcoinAuthorization) {
                requestOptions.headers = {
                    Authorization: `Basic ${this.bitcoinAuthorization}`
                };
            }
            const rpcUrl = isWalletRpc ? `${this.bitcoinPeerUri}/wallet/${this.walletNameToUse}` : this.bitcoinPeerUri;
            const bodyBuffer = yield this.fetchWithRetry(rpcUrl, requestOptions, timeout);
            const responseJson = JSON.parse(bodyBuffer.toString());
            if ('error' in responseJson && responseJson.error !== null) {
                const error = new Error(`RPC failed: ${JSON.stringify(responseJson.error)}`);
                Logger_1.default.error(error);
                throw error;
            }
            return responseJson.result;
        });
    }
    fetchWithRetry(uri, requestParameters, enableTimeout) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let retryCount = 0;
            let networkError;
            let requestTimeout = enableTimeout ? this.requestTimeout : 0;
            do {
                if (networkError !== undefined) {
                    retryCount++;
                    requestTimeout *= 2;
                    Logger_1.default.info(`Retrying attempt count: ${retryCount} with request timeout of ${requestTimeout} ms...`);
                }
                let response;
                try {
                    const params = Object.assign({}, requestParameters);
                    params.timeout = requestTimeout;
                    response = yield (0, node_fetch_1.default)(uri, params);
                }
                catch (error) {
                    if (error instanceof node_fetch_1.FetchError && error.type === 'request-timeout') {
                        networkError = error;
                        Logger_1.default.info(`Attempt ${retryCount} timed-out.`);
                        continue;
                    }
                    throw error;
                }
                const bodyBuffer = yield ReadableStream_1.default.readAll(response.body);
                if (response.status === httpStatus.OK) {
                    return bodyBuffer;
                }
                else {
                    networkError = new SidetreeError_1.default(ErrorCode_1.default.BitcoinClientFetchHttpCodeWithNetworkIssue, `Network issue with HTTP response: [${response.status}]: ${bodyBuffer}`);
                    if (response.status === httpStatus.BAD_GATEWAY ||
                        response.status === httpStatus.GATEWAY_TIMEOUT ||
                        response.status === httpStatus.SERVICE_UNAVAILABLE) {
                        Logger_1.default.info(`Attempt ${retryCount} resulted in ${response.status}`);
                        continue;
                    }
                    throw new SidetreeError_1.default(ErrorCode_1.default.BitcoinClientFetchUnexpectedError, `Unexpected fetch HTTP response: [${response.status}]: ${bodyBuffer}`);
                }
            } while (retryCount < this.requestMaxRetries);
            Logger_1.default.info('Max retries reached without success.');
            throw networkError;
        });
    }
}
exports.default = BitcoinClient;
//# sourceMappingURL=BitcoinClient.js.map