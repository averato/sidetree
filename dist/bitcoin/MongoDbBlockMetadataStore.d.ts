import BlockMetadata from './models/BlockMetadata';
import IBlockMetadataStore from './interfaces/IBlockMetadataStore';
import MongoDbStore from '../common/MongoDbStore';
export default class MongoDbBlockMetadataStore extends MongoDbStore implements IBlockMetadataStore {
    static readonly collectionName = "blocks";
    private static readonly optionToExcludeIdField;
    constructor(serverUrl: string, databaseName: string);
    createIndex(): Promise<void>;
    add(arrayOfBlockMetadata: BlockMetadata[]): Promise<void>;
    removeLaterThan(blockHeight?: number): Promise<void>;
    get(fromInclusiveHeight: number, toExclusiveHeight: number): Promise<BlockMetadata[]>;
    getLast(): Promise<BlockMetadata | undefined>;
    private getFirst;
    lookBackExponentially(): Promise<BlockMetadata[]>;
}
