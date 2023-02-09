import ProtocolParameters from './ProtocolParameters';
export default interface BitcoinVersionModel {
    startingBlockchainTime: number;
    version: string;
    protocolParameters: ProtocolParameters;
}
