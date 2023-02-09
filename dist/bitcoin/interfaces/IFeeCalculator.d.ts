import BlockMetadata from '../models/BlockMetadata';
import BlockMetadataWithoutNormalizedFee from '../models/BlockMetadataWithoutNormalizedFee';
export default interface IFeeCalculator {
    getNormalizedFee(block: number): Promise<number>;
    calculateNormalizedTransactionFeeFromBlock(blockMetaData: BlockMetadata): number;
    addNormalizedFeeToBlockMetadata(blockMetadataWithoutFee: BlockMetadataWithoutNormalizedFee): Promise<BlockMetadata>;
}
