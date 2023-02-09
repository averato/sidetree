"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ErrorCode_1 = require("../ErrorCode");
const LockIdentifierSerializer_1 = require("./LockIdentifierSerializer");
const Logger_1 = require("../../common/Logger");
const bitcore_lib_1 = require("bitcore-lib");
const SidetreeError_1 = require("../../common/SidetreeError");
class LockResolver {
    constructor(versionManager, bitcoinClient) {
        this.versionManager = versionManager;
        this.bitcoinClient = bitcoinClient;
    }
    resolveSerializedLockIdentifierAndThrowOnError(serializedLockIdentifier) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const lockIdentifier = LockIdentifierSerializer_1.default.deserialize(serializedLockIdentifier);
            return this.resolveLockIdentifierAndThrowOnError(lockIdentifier);
        });
    }
    resolveLockIdentifierAndThrowOnError(lockIdentifier) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Starting lock resolution for identifier: ${JSON.stringify(lockIdentifier)}`);
            const redeemScriptObj = LockResolver.createScript(lockIdentifier.redeemScriptAsHex);
            const scriptVerifyResult = LockResolver.isRedeemScriptALockScript(redeemScriptObj);
            if (!scriptVerifyResult.isScriptValid) {
                throw new SidetreeError_1.default(ErrorCode_1.default.LockResolverRedeemScriptIsNotLock, `${redeemScriptObj.toASM()}`);
            }
            const lockTransaction = yield this.getTransaction(lockIdentifier.transactionId);
            const transactionIsPayingToTargetRedeemScript = lockTransaction.outputs.length > 0 &&
                LockResolver.isOutputPayingToTargetScript(lockTransaction.outputs[0], redeemScriptObj);
            if (!transactionIsPayingToTargetRedeemScript) {
                throw new SidetreeError_1.default(ErrorCode_1.default.LockResolverTransactionIsNotPayingToScript, `Transaction id: ${lockIdentifier.transactionId} Script: ${redeemScriptObj.toASM()}`);
            }
            const serializedLockIdentifier = LockIdentifierSerializer_1.default.serialize(lockIdentifier);
            const lockStartBlock = yield this.calculateLockStartingBlock(lockTransaction);
            const unlockAtBlock = lockStartBlock + scriptVerifyResult.lockDurationInBlocks;
            const lockDurationInBlocks = this.versionManager.getLockDurationInBlocks(lockStartBlock);
            if (this.versionManager.getLockDurationInBlocks(lockStartBlock) !== scriptVerifyResult.lockDurationInBlocks) {
                throw new SidetreeError_1.default(ErrorCode_1.default.LockResolverDurationIsInvalid, `Lock start block: ${lockStartBlock}. Unlock block: ${unlockAtBlock}. Invalid duration: ${scriptVerifyResult.lockDurationInBlocks}. Allowed duration: ${lockDurationInBlocks}`);
            }
            const normalizedFee = yield this.versionManager.getFeeCalculator(lockStartBlock).getNormalizedFee(lockStartBlock);
            return {
                identifier: serializedLockIdentifier,
                amountLocked: lockTransaction.outputs[0].satoshis,
                lockTransactionTime: lockStartBlock,
                unlockTransactionTime: unlockAtBlock,
                normalizedFee: normalizedFee,
                owner: scriptVerifyResult.publicKeyHash
            };
        });
    }
    static isRedeemScriptALockScript(redeemScript) {
        const scriptAsmParts = redeemScript.toASM().split(' ');
        const isScriptValid = scriptAsmParts.length === 8 &&
            scriptAsmParts[1] === 'OP_NOP3' &&
            scriptAsmParts[2] === 'OP_DROP' &&
            scriptAsmParts[3] === 'OP_DUP' &&
            scriptAsmParts[4] === 'OP_HASH160' &&
            scriptAsmParts[6] === 'OP_EQUALVERIFY' &&
            scriptAsmParts[7] === 'OP_CHECKSIG';
        let lockDurationInBlocks;
        let publicKeyHash;
        if (isScriptValid) {
            const lockDurationInBlocksBuffer = Buffer.from(scriptAsmParts[0], 'hex');
            lockDurationInBlocks = lockDurationInBlocksBuffer.readIntLE(0, lockDurationInBlocksBuffer.length);
            publicKeyHash = scriptAsmParts[5];
        }
        return {
            isScriptValid: isScriptValid,
            publicKeyHash: publicKeyHash,
            lockDurationInBlocks: lockDurationInBlocks
        };
    }
    static isOutputPayingToTargetScript(bitcoinOutput, targetScript) {
        const targetScriptHashOut = bitcore_lib_1.Script.buildScriptHashOut(targetScript);
        return bitcoinOutput.scriptAsmAsString === targetScriptHashOut.toASM();
    }
    static createScript(redeemScriptAsHex) {
        try {
            const redeemScriptAsBuffer = Buffer.from(redeemScriptAsHex, 'hex');
            return new bitcore_lib_1.Script(redeemScriptAsBuffer);
        }
        catch (e) {
            throw SidetreeError_1.default.createFromError(ErrorCode_1.default.LockResolverRedeemScriptIsInvalid, e);
        }
    }
    getTransaction(transactionId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                return this.bitcoinClient.getRawTransaction(transactionId);
            }
            catch (e) {
                throw SidetreeError_1.default.createFromError(ErrorCode_1.default.LockResolverTransactionNotFound, e);
            }
        });
    }
    calculateLockStartingBlock(transaction) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (transaction.confirmations <= 0) {
                throw new SidetreeError_1.default(ErrorCode_1.default.LockResolverTransactionNotConfirmed, `transaction id: ${transaction.id}`);
            }
            const blockInfo = yield this.bitcoinClient.getBlockInfo(transaction.blockHash);
            return blockInfo.height;
        });
    }
}
exports.default = LockResolver;
//# sourceMappingURL=LockResolver.js.map