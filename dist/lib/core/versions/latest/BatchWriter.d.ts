import IBatchWriter from '../../interfaces/IBatchWriter';
import IBlockchain from '../../interfaces/IBlockchain';
import ICas from '../../interfaces/ICas';
import IConfirmationStore from '../../interfaces/IConfirmationStore';
import IOperationQueue from './interfaces/IOperationQueue';
import IVersionMetadataFetcher from '../../interfaces/IVersionMetadataFetcher';
import ValueTimeLockModel from '../../../common/models/ValueTimeLockModel';
export default class BatchWriter implements IBatchWriter {
    private operationQueue;
    private blockchain;
    private cas;
    private versionMetadataFetcher;
    private confirmationStore;
    constructor(operationQueue: IOperationQueue, blockchain: IBlockchain, cas: ICas, versionMetadataFetcher: IVersionMetadataFetcher, confirmationStore: IConfirmationStore);
    write(): Promise<number>;
    private createAndWriteChunkFileIfNeeded;
    private createAndWriteProvisionalIndexFileIfNeeded;
    private static hasEnoughConfirmations;
    static getNumberOfOperationsAllowed(versionMetadataFetcher: IVersionMetadataFetcher, valueTimeLock: ValueTimeLockModel | undefined): number;
}
