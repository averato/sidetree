import AbstractVersionMetadata from '../abstracts/AbstractVersionMetadata';
export default interface IVersionMetadataFetcher {
    getVersionMetadata(blockchainTime: number): AbstractVersionMetadata;
}
