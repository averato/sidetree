"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ErrorCode_1 = tslib_1.__importDefault(require("./ErrorCode"));
const SidetreeError_1 = tslib_1.__importDefault(require("../common/SidetreeError"));
class VersionManager {
    constructor() {
        this.versionsReverseSorted = [];
        this.feeCalculators = new Map();
        this.protocolParameters = new Map();
    }
    initialize(versions, config, blockMetadataStore) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.versionsReverseSorted = versions.sort((a, b) => b.startingBlockchainTime - a.startingBlockchainTime);
            for (const versionModel of this.versionsReverseSorted) {
                const version = versionModel.version;
                this.protocolParameters.set(version, versionModel.protocolParameters);
                const initialNormalizedFeeInSatoshis = versionModel.protocolParameters.initialNormalizedFeeInSatoshis;
                const feeLookBackWindowInBlocks = versionModel.protocolParameters.feeLookBackWindowInBlocks;
                const feeMaxFluctuationMultiplierPerBlock = versionModel.protocolParameters.feeMaxFluctuationMultiplierPerBlock;
                const FeeCalculator = yield this.loadDefaultExportsForVersion(version, 'NormalizedFeeCalculator');
                const feeCalculator = new FeeCalculator(blockMetadataStore, config.genesisBlockNumber, initialNormalizedFeeInSatoshis, feeLookBackWindowInBlocks, feeMaxFluctuationMultiplierPerBlock);
                this.feeCalculators.set(version, feeCalculator);
            }
        });
    }
    getFeeCalculator(blockHeight) {
        const version = this.getVersionString(blockHeight);
        const feeCalculator = this.feeCalculators.get(version);
        return feeCalculator;
    }
    getLockDurationInBlocks(blockHeight) {
        const version = this.getVersionString(blockHeight);
        const protocolParameter = this.protocolParameters.get(version);
        return protocolParameter.valueTimeLockDurationInBlocks;
    }
    getVersionString(blockHeight) {
        for (const versionModel of this.versionsReverseSorted) {
            if (blockHeight >= versionModel.startingBlockchainTime) {
                return versionModel.version;
            }
        }
        throw new SidetreeError_1.default(ErrorCode_1.default.VersionManagerVersionStringNotFound, `Unable to find version string for block ${blockHeight}.`);
    }
    loadDefaultExportsForVersion(version, className) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a;
            const defaults = (yield (_a = `./versions/${version}/${className}`, Promise.resolve().then(() => tslib_1.__importStar(require(_a))))).default;
            return defaults;
        });
    }
}
exports.default = VersionManager;
//# sourceMappingURL=VersionManager.js.map