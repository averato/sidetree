import BlockMetadata from '../models/BlockMetadata';
export default interface IBlockMetadataStore {
    add(blockMetadata: BlockMetadata[]): Promise<void>;
    removeLaterThan(blockHeight?: number): Promise<void>;
    get(fromInclusiveHeight: number, toExclusiveHeight: number): Promise<BlockMetadata[]>;
    getLast(): Promise<BlockMetadata | undefined>;
    lookBackExponentially(maxHeight: number, minHeight: number): Promise<BlockMetadata[]>;
}
