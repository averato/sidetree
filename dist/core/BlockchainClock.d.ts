import IBlockchain from '../core/interfaces/IBlockchain';
import IServiceStateStore from '../common/interfaces/IServiceStateStore';
import ServiceStateModel from './models/ServiceStateModel';
export default class BlockchainClock {
    private blockchain;
    private serviceStateStore;
    private enableRealBlockchainTimePull;
    private continuePulling;
    private blockchainTimePullIntervalInSeconds;
    private cachedApproximateTime?;
    constructor(blockchain: IBlockchain, serviceStateStore: IServiceStateStore<ServiceStateModel>, enableRealBlockchainTimePull: boolean);
    getTime(): number | undefined;
    startPeriodicPullLatestBlockchainTime(): Promise<void>;
    private pullRealBlockchainTime;
}
