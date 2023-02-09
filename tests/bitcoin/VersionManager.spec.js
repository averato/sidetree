"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ErrorCode_1 = require("../../lib/bitcoin/ErrorCode");
const JasmineSidetreeErrorValidator_1 = require("../JasmineSidetreeErrorValidator");
const MockBlockMetadataStore_1 = require("../mocks/MockBlockMetadataStore");
const VersionManager_1 = require("../../lib/bitcoin/VersionManager");
describe('VersionManager', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    describe('getFeeCalculator()', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        it('should return the correct version of fee calculator.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const versionModels = [
                { startingBlockchainTime: 1000, version: '1000', protocolParameters: { valueTimeLockDurationInBlocks: 5, initialNormalizedFeeInSatoshis: 1, feeLookBackWindowInBlocks: 1, feeMaxFluctuationMultiplierPerBlock: 1 } },
                { startingBlockchainTime: 2000, version: '2000', protocolParameters: { valueTimeLockDurationInBlocks: 5, initialNormalizedFeeInSatoshis: 1, feeLookBackWindowInBlocks: 1, feeMaxFluctuationMultiplierPerBlock: 1 } }
            ];
            const versionManager = new VersionManager_1.default();
            const mockFeeCalculator1 = class {
                getNormalizedFee() { return 1000; }
            };
            const mockFeeCalculator2 = class {
                getNormalizedFee() { return 2000; }
            };
            spyOn(versionManager, 'loadDefaultExportsForVersion').and.callFake((version, _className) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                if (version === '1000') {
                    return mockFeeCalculator1;
                }
                else {
                    return mockFeeCalculator2;
                }
            }));
            yield versionManager.initialize(versionModels, { genesisBlockNumber: 1 }, new MockBlockMetadataStore_1.default());
            const fee = yield versionManager.getFeeCalculator(2001).getNormalizedFee(2001);
            expect(fee).toEqual(2000);
        }));
    }));
    describe('getVersionString()', () => {
        it('should throw if version given is not in the supported version list.', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const versionManager = new VersionManager_1.default();
            JasmineSidetreeErrorValidator_1.default.expectSidetreeErrorToBeThrown(() => versionManager.getVersionString(1), ErrorCode_1.default.VersionManagerVersionStringNotFound);
        }));
    });
    describe('getLockDurationInBlocks', () => {
        it('should get the correct lock duration', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const versionModels = [
                { startingBlockchainTime: 1000, version: '1000', protocolParameters: { valueTimeLockDurationInBlocks: 123, initialNormalizedFeeInSatoshis: 1, feeLookBackWindowInBlocks: 1, feeMaxFluctuationMultiplierPerBlock: 1 } },
                { startingBlockchainTime: 2000, version: '2000', protocolParameters: { valueTimeLockDurationInBlocks: 456, initialNormalizedFeeInSatoshis: 1, feeLookBackWindowInBlocks: 1, feeMaxFluctuationMultiplierPerBlock: 1 } }
            ];
            const versionManager = new VersionManager_1.default();
            spyOn(versionManager, 'loadDefaultExportsForVersion').and.callFake((_version, _className) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                return class {
                    getNormalizedFee() { return 1000; }
                };
            }));
            yield versionManager.initialize(versionModels, { genesisBlockNumber: 1 }, new MockBlockMetadataStore_1.default());
            const result = versionManager.getLockDurationInBlocks(1500);
            expect(result).toEqual(123);
            const result2 = versionManager.getLockDurationInBlocks(2500);
            expect(result2).toEqual(456);
        }));
    });
}));
//# sourceMappingURL=VersionManager.spec.js.map