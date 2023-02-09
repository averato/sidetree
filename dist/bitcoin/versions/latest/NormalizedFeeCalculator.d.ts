import BlockMetadata from '../../models/BlockMetadata';
import BlockMetadataWithoutNormalizedFee from '../../models/BlockMetadataWithoutNormalizedFee';
import IBlockMetadataStore from '../../interfaces/IBlockMetadataStore';
import IFeeCalculator from '../../interfaces/IFeeCalculator';
export default class NormalizedFeeCalculator implements IFeeCalculator {
    private blockMetadataStore;
    private genesisBlockNumber;
    private initialNormalizedFeeInSatoshis;
    private feeLookBackWindowInBlocks;
    private feeMaxFluctuationMultiplierPerBlock;
    private cachedLookBackWindow;
    private blockHeightOfCachedLookBackWindow;
    constructor(blockMetadataStore: IBlockMetadataStore, genesisBlockNumber: number, initialNormalizedFeeInSatoshis: number, feeLookBackWindowInBlocks: number, feeMaxFluctuationMultiplierPerBlock: number);
    initialize(): Promise<void>;
    addNormalizedFeeToBlockMetadata(blockMetadata: BlockMetadataWithoutNormalizedFee): Promise<BlockMetadata>;
    getNormalizedFee(block: number): Promise<number>;
    calculateNormalizedTransactionFeeFromBlock(block: BlockMetadata): number;
    private getBlocksInLookBackWindow;
    private calculateNormalizedFee;
    private adjustFeeToWithinFluctuationRate;
    private isCacheValid;
}
