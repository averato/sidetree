import BitcoinVersionModel from './models/BitcoinVersionModel';
import IBitcoinConfig from './IBitcoinConfig';
import IBlockMetadataStore from './interfaces/IBlockMetadataStore';
import IFeeCalculator from './interfaces/IFeeCalculator';
export default class VersionManager {
    private versionsReverseSorted;
    private feeCalculators;
    private protocolParameters;
    constructor();
    initialize(versions: BitcoinVersionModel[], config: IBitcoinConfig, blockMetadataStore: IBlockMetadataStore): Promise<void>;
    getFeeCalculator(blockHeight: number): IFeeCalculator;
    getLockDurationInBlocks(blockHeight: number): number;
    private getVersionString;
    private loadDefaultExportsForVersion;
}
