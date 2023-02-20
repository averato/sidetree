"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ErrorCode_1 = require("../../ErrorCode");
const LogColor_1 = require("../../../common/LogColor");
const Logger_1 = require("../../../common/Logger");
const SidetreeError_1 = require("../../../common/SidetreeError");
class NormalizedFeeCalculator {
    constructor(blockMetadataStore, genesisBlockNumber, initialNormalizedFeeInSatoshis, feeLookBackWindowInBlocks, feeMaxFluctuationMultiplierPerBlock) {
        this.blockMetadataStore = blockMetadataStore;
        this.genesisBlockNumber = genesisBlockNumber;
        this.initialNormalizedFeeInSatoshis = initialNormalizedFeeInSatoshis;
        this.feeLookBackWindowInBlocks = feeLookBackWindowInBlocks;
        this.feeMaxFluctuationMultiplierPerBlock = feeMaxFluctuationMultiplierPerBlock;
        this.blockHeightOfCachedLookBackWindow = undefined;
        this.cachedLookBackWindow = [];
    }
    initialize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info(`Initializing normalized fee calculator.`);
        });
    }
    addNormalizedFeeToBlockMetadata(blockMetadata) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (blockMetadata.height < this.genesisBlockNumber + this.feeLookBackWindowInBlocks) {
                const blockWithFee = Object.assign({ normalizedFee: this.initialNormalizedFeeInSatoshis }, blockMetadata);
                this.cachedLookBackWindow.push(blockWithFee);
                this.blockHeightOfCachedLookBackWindow = blockMetadata.height + 1;
                return blockWithFee;
            }
            if (!this.isCacheValid(blockMetadata.height)) {
                this.cachedLookBackWindow = yield this.getBlocksInLookBackWindow(blockMetadata.height);
                this.blockHeightOfCachedLookBackWindow = blockMetadata.height;
            }
            const normalizedFee = this.calculateNormalizedFee(this.cachedLookBackWindow);
            const newBlockWithFee = Object.assign({ normalizedFee }, blockMetadata);
            this.cachedLookBackWindow.push(newBlockWithFee);
            this.cachedLookBackWindow.shift();
            this.blockHeightOfCachedLookBackWindow++;
            Logger_1.default.info(LogColor_1.default.lightBlue(`Calculated raw normalized fee for block ${LogColor_1.default.green(blockMetadata.height)}: ${LogColor_1.default.green(normalizedFee)}`));
            return newBlockWithFee;
        });
    }
    getNormalizedFee(block) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const blockMetadata = yield this.blockMetadataStore.get(block, block + 1);
            if (blockMetadata.length === 0) {
                throw new SidetreeError_1.default(ErrorCode_1.default.NormalizedFeeCalculatorBlockNotFound);
            }
            return this.calculateNormalizedTransactionFeeFromBlock(blockMetadata[0]);
        });
    }
    calculateNormalizedTransactionFeeFromBlock(block) {
        return Math.floor(block.normalizedFee);
    }
    getBlocksInLookBackWindow(block) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const blockMetadataArray = yield this.blockMetadataStore.get(block - this.feeLookBackWindowInBlocks, block);
            return blockMetadataArray;
        });
    }
    calculateNormalizedFee(blocksToAverage) {
        let totalFee = 0;
        let totalTransactionCount = 0;
        for (const blockToAverage of blocksToAverage) {
            totalFee += blockToAverage.totalFee;
            totalTransactionCount += blockToAverage.transactionCount;
        }
        const unadjustedFee = totalFee / totalTransactionCount;
        const previousFee = blocksToAverage[blocksToAverage.length - 1].normalizedFee;
        return this.adjustFeeToWithinFluctuationRate(unadjustedFee, previousFee);
    }
    adjustFeeToWithinFluctuationRate(unadjustedFee, previousFee) {
        const maxAllowedFee = previousFee * (1 + this.feeMaxFluctuationMultiplierPerBlock);
        const minAllowedFee = previousFee * (1 - this.feeMaxFluctuationMultiplierPerBlock);
        if (unadjustedFee > maxAllowedFee) {
            return maxAllowedFee;
        }
        if (unadjustedFee < minAllowedFee) {
            return minAllowedFee;
        }
        return unadjustedFee;
    }
    isCacheValid(blockHeight) {
        return this.blockHeightOfCachedLookBackWindow === blockHeight &&
            this.feeLookBackWindowInBlocks === this.cachedLookBackWindow.length;
    }
}
exports.default = NormalizedFeeCalculator;
//# sourceMappingURL=NormalizedFeeCalculator.js.map